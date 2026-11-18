import java.util.*;
public class GoBackN {
    public static Map<String,Object> simulate(List<Map<String,Object>> packets,int win,double loss,int delay,int maxAttempts,Random random){
        class Rec {int id,releaseTick,attempts=0; Integer receivedTick=null,firstSentTick=null; String status="pending";
            Rec(Map<String,Object> p){id=((Number)p.get("id")).intValue();releaseTick=((Number)p.get("releaseTick")).intValue();}}
        List<Rec> records=new ArrayList<>();for(Map<String,Object> p:packets)records.add(new Rec(p));
        int base=0,clock=0,trans=0,retx=0,lossEvents=0;boolean aborted=false;
        List<String> events=new ArrayList<>();List<Map<String,Object>> trace=new ArrayList<>();
        int timeout=2*delay+1;
        while(base<records.size()){
            int roundBase=base,windowEnd=Math.min(roundBase+win,records.size()),firstMissing=-1;boolean retryLimitHit=false;
            List<Map<String,Object>> frames=new ArrayList<>();
            for(int i=roundBase;i<windowEnd;i++){
                Rec p=records.get(i);if("received".equals(p.status))continue;
                if(p.attempts>=maxAttempts){aborted=true;retryLimitHit=true;
                    events.add("TCP-style: retry limit reached at packet "+p.id+"; unresolved stream abandoned.");
                    frames.add(frame(p.id,i,"retry-limit",p.attempts,false));break;}
                boolean retrans=p.attempts>0;if(retrans)retx++;
                p.attempts++;trans++;if(p.firstSentTick==null)p.firstSentTick=clock;clock+=delay;
                if(random.nextDouble()<loss){lossEvents++;if(firstMissing<0)firstMissing=i;
                    frames.add(frame(p.id,i,"lost",p.attempts,retrans));events.add("TCP-style: packet "+p.id+" lost on attempt "+p.attempts+".");}
                else if(firstMissing>=0){frames.add(frame(p.id,i,"out-of-order",p.attempts,retrans));
                    events.add("TCP-style: packet "+p.id+" arrived after a gap and was discarded by the GBN receiver.");}
                else {p.status="received";p.receivedTick=clock;frames.add(frame(p.id,i,retrans?"recovered":"accepted",p.attempts,retrans));
                    events.add("TCP-style: packet "+p.id+" accepted in order; cumulative ACK advances.");}
            }
            while(base<records.size()&&"received".equals(records.get(base).status))base++;
            int ack=base-1;Integer retryFrom=null; if(firstMissing>=0) retryFrom=Integer.valueOf(firstMissing); else if(base<records.size()) retryFrom=Integer.valueOf(base);
            Map<String,Object> tr=new LinkedHashMap<>();
            tr.put("round",trace.size()+1);tr.put("windowStart",roundBase);tr.put("windowEnd",windowEnd-1);tr.put("windowSize",win);
            tr.put("frames",frames);tr.put("acknowledgedThrough",ack);tr.put("nextBase",base);tr.put("retryFrom",retryFrom);
            tr.put("timeout",firstMissing>=0&&!retryLimitHit);tr.put("retryLimitHit",retryLimitHit);tr.put("clock",clock);trace.add(tr);
            if(base>=records.size()||aborted)break;
            if(firstMissing>=0){clock+=timeout;events.add("TCP-style: timeout; Go-Back-N retries from packet "+records.get(base).id+" with a window of up to "+win+".");continue;}
            if(base>=windowEnd)continue;
            aborted=true;events.add("TCP-style: stopped safely because the sender window made no progress.");break;
        }
        if(aborted)for(Rec p:records)if(!"received".equals(p.status))p.status="abandoned";
        int good=0,uniqueDropped;double totalDelay=0;
        for(Rec p:records)if("received".equals(p.status)){good++;totalDelay+=(p.receivedTick-p.firstSentTick);}
        uniqueDropped=records.size()-good;int duration=Math.max(1,clock);
        Map<String,Object> out=new LinkedHashMap<>();
        out.put("attempted",packets.size());out.put("received",good);out.put("dropped",uniqueDropped);out.put("retx",retx);
        out.put("netLost",lossEvents);out.put("trans",trans);out.put("duration",duration);
        out.put("throughput",(double)good/duration);out.put("dataRate",(double)good*1024/duration);
        out.put("delay",good>0?totalDelay/good:0);out.put("pdr",packets.size()>0?(double)good/packets.size():0);
        out.put("events",events.subList(Math.max(0,events.size()-24),events.size()));out.put("trace",trace);out.put("aborted",aborted);
        return out;
    }
    private static Map<String,Object> frame(int id,int index,String outcome,int attempt,boolean retrans){
        Map<String,Object> f=new LinkedHashMap<>();f.put("id",id);f.put("index",index);f.put("outcome",outcome);f.put("attempt",attempt);f.put("retransmission",retrans);return f;
    }
}
