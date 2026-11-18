import java.util.*;
public class MetricsCalculator {
    public static Map<String,Object> calculate(Map<String,Object> bucket,Map<String,Object> tcp,Map<String,Object> udp){
        Map<String,Object> out=new LinkedHashMap<>();
        out.put("releasedPackets",((List<?>)bucket.get("released")).size());
        out.put("bucketOverflowDrops",bucket.get("overflow"));
        out.put("tcpReceived",tcp.get("received"));out.put("udpReceived",udp.get("received"));
        out.put("tcpDropped",tcp.get("dropped"));out.put("udpDropped",udp.get("dropped"));
        out.put("tcpRetransmissions",tcp.get("retx"));out.put("udpRetransmissions",udp.get("retx"));
        return out;
    }
}
