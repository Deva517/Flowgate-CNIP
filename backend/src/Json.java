import java.util.*;
public class Json {
    public static String stringify(Object v){
        if(v==null)return "null";
        if(v instanceof String)return "\""+esc((String)v)+"\"";
        if(v instanceof Number||v instanceof Boolean)return String.valueOf(v);
        if(v instanceof Map){StringJoiner j=new StringJoiner(",","{","}");for(Object x:((Map<?,?>)v).entrySet()){Map.Entry<?,?> e=(Map.Entry<?,?>)x;j.add(stringify(String.valueOf(e.getKey()))+":"+stringify(e.getValue()));}return j.toString();}
        if(v instanceof Iterable){StringJoiner j=new StringJoiner(",","[","]");for(Object x:(Iterable<?>)v)j.add(stringify(x));return j.toString();}
        return stringify(String.valueOf(v));
    }
    private static String esc(String s){return s.replace("\\","\\\\").replace("\"","\\\"").replace("\n","\\n").replace("\r","\\r").replace("\t","\\t");}
}
