import java.util.*;
public class UdpSimulation {
    public static Map<String,Object> simulate(List<Map<String,Object>> packets,double loss,int delay,Random random){
        int received=0,lossEvents=0,trans=0;double totalDelay=0;List<String> events=new ArrayList<>();
        for(Map<String,Object> p:packets){trans++;int id=((Number)p.get("id")).intValue();
            if(random.nextDouble()<loss){lossEvents++;events.add("UDP-style: packet "+id+" lost; UDP does not retransmit it automatically.");}
            else{received++;totalDelay+=2.0*delay;}}
        int duration=Math.max(1,(packets.isEmpty()?0:((Number)packets.get(packets.size()-1).get("releaseTick")).intValue())+2*delay);
        Map<String,Object> out=new LinkedHashMap<>();out.put("attempted",packets.size());out.put("received",received);
        out.put("dropped",packets.size()-received);out.put("retx",0);out.put("netLost",lossEvents);out.put("trans",trans);
        out.put("duration",duration);out.put("throughput",(double)received/duration);out.put("dataRate",(double)received*1024/duration);
        out.put("delay",received>0?totalDelay/received:0);out.put("pdr",packets.isEmpty()?0:(double)received/packets.size());
        out.put("events",events.subList(Math.max(0,events.size()-18),events.size()));out.put("aborted",false);return out;
    }
}
