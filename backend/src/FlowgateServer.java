import com.sun.net.httpserver.*;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class FlowgateServer {
    public static void main(String[] args) throws Exception {
        int port=8765;
        HttpServer server=HttpServer.create(new InetSocketAddress(port),0);
        server.createContext("/api/simulate",exchange->{
            addCors(exchange);
            if("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())){exchange.sendResponseHeaders(204,-1);return;}
            if(!"POST".equalsIgnoreCase(exchange.getRequestMethod())){send(exchange,405,"{\"error\":\"POST required\"}");return;}
            try{
                String body=new String(exchange.getRequestBody().readAllBytes(),StandardCharsets.UTF_8);
                Map<String,String> p=parse(body);
                int n=num(p,"n",100),win=num(p,"win",4),cap=num(p,"cap",12),rate=num(p,"rate",5),delay=num(p,"delay",2);
                double loss=num(p,"loss",10)/100.0;
                String preset=p.getOrDefault("preset","medium");
                String source=p.getOrDefault("source","Node A"),dest=p.getOrDefault("dest","Node D");
                long seed=seed(n,loss,win,cap,rate,delay,source,dest);
                Map<String,Object> bucket=LeakyBucket.simulate(n,cap,rate,preset,new Random(seed+1));
                @SuppressWarnings("unchecked") List<Map<String,Object>> released=(List<Map<String,Object>>)bucket.get("released");
                Map<String,Object> tcp=GoBackN.simulate(released,win,loss,delay,6,new Random(seed+101));
                Map<String,Object> udp=UdpSimulation.simulate(released,loss,delay,new Random(seed+202));
                Map<String,Object> result=new LinkedHashMap<>();result.put("bucket",bucket);result.put("tcp",tcp);result.put("udp",udp);
                result.put("metrics",MetricsCalculator.calculate(bucket,tcp,udp));
                send(exchange,200,Json.stringify(result));
            }catch(Exception ex){ex.printStackTrace();send(exchange,400,"{\"error\":\""+escape(ex.getMessage())+"\"}");}
        });
        server.start();
        System.out.println("Flowgate Java backend running at http://localhost:"+port);
        System.out.println("Keep this terminal open while using the website.");
    }
    static long seed(int n,double loss,int win,int cap,int rate,int delay,String source,String dest){
        int s=source.isEmpty()?1:source.charAt(source.length()-1),d=dest.isEmpty()?1:dest.charAt(dest.length()-1);
        return (long)n*31+Math.round(loss*1000)*17L+win*13L+cap*7L+rate*5L+delay*3L+s*11L+d*19L;
    }
    static int num(Map<String,String> p,String k,int def){try{return Integer.parseInt(p.get(k));}catch(Exception e){return def;}}
    static Map<String,String> parse(String body)throws Exception{
        Map<String,String> map=new HashMap<>();
        for(String pair:body.split("&")){String[] kv=pair.split("=",2);if(kv.length==2)map.put(URLDecoder.decode(kv[0],"UTF-8"),URLDecoder.decode(kv[1],"UTF-8"));}
        return map;
    }
    static void addCors(HttpExchange e){e.getResponseHeaders().add("Access-Control-Allow-Origin","*");e.getResponseHeaders().add("Access-Control-Allow-Methods","POST, OPTIONS");e.getResponseHeaders().add("Access-Control-Allow-Headers","Content-Type");}
    static void send(HttpExchange e,int status,String text)throws IOException{byte[] b=text.getBytes(StandardCharsets.UTF_8);e.getResponseHeaders().set("Content-Type","application/json; charset=utf-8");e.sendResponseHeaders(status,b.length);e.getResponseBody().write(b);e.close();}
    static String escape(String s){return s==null?"unknown":s.replace("\\","\\\\").replace("\"","\\\"").replace("\n"," ");}
}
