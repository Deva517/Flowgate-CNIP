import java.util.*;
public class LeakyBucket {
    public static Map<String,Object> simulate(int n,int cap,int rate,String preset,Random random){
        List<Packet> queue=new ArrayList<>();
        List<Map<String,Object>> released=new ArrayList<>();
        List<Map<String,Object>> levels=new ArrayList<>();
        int generated=0,admitted=0,overflow=0,tick=0;
        int safetyLimit=n*4+100;
        while((generated<n||!queue.isEmpty())&&tick<safetyLimit){
            int burst;
            if("high".equals(preset)) burst=8+random.nextInt(7);
            else if("medium".equals(preset)) burst=4+random.nextInt(5);
            else burst=2+random.nextInt(4);
            for(int k=0;k<burst&&generated<n;k++){
                generated++;
                if(queue.size()<cap){queue.add(new Packet(generated,tick));admitted++;}
                else overflow++;
            }
            int count=Math.min(queue.size(),rate);
            for(int k=0;k<count;k++){
                Packet p=queue.remove(0); p.releaseTick=tick;
                Map<String,Object> item=new LinkedHashMap<>();
                item.put("id",p.id);item.put("arrivalTick",p.arrivalTick);item.put("releaseTick",p.releaseTick);
                released.add(item);
            }
            Map<String,Object> level=new LinkedHashMap<>();
            level.put("tick",tick);level.put("level",queue.size());level.put("overflow",overflow);level.put("released",count);
            levels.add(level);tick++;
        }
        Map<String,Object> out=new LinkedHashMap<>();
        out.put("generated",generated);out.put("admitted",admitted);out.put("overflow",overflow);
        out.put("released",released);out.put("levels",levels);out.put("ticks",tick);out.put("capacity",cap);out.put("rate",rate);
        return out;
    }
}
