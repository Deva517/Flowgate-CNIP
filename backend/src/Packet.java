public class Packet {
    public final int id;
    public final int arrivalTick;
    public int releaseTick;
    public int attempts=0;
    public Integer receivedTick=null;
    public Integer firstSentTick=null;
    public String status="pending";
    public Packet(int id,int arrivalTick){this.id=id;this.arrivalTick=arrivalTick;}
}
