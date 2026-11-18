FLOWGATE — JAVA ALGORITHM BACKEND
================================

Frontend:
- Existing HTML, CSS, JavaScript UI and Chart.js are preserved.
- JavaScript is used only for browser interactions, calling the backend and rendering charts/results.
- The networking algorithm implementations now run in Java.

Java algorithms:
- backend/src/LeakyBucket.java
- backend/src/GoBackN.java
- backend/src/UdpSimulation.java
- backend/src/MetricsCalculator.java
- backend/src/FlowgateServer.java (built-in Java HTTP server/API)
- backend/src/Json.java (JSON response serializer)
- backend/src/Packet.java

Requirements:
- JDK 17 or later recommended.
- No Maven, Gradle, Spring Boot or external Java libraries required.

HOW TO RUN (Windows):
1. Extract the complete Flowgate folder.
2. Open the folder in VS Code.
3. Check Java is installed: open terminal and run `java -version` and `javac -version`.
4. Double-click backend/start.bat. Keep its terminal open.
5. In VS Code, right-click index.html and choose Open with Live Server.
6. In the browser, configure the experiment and click "Run TCP vs UDP comparison".
7. The frontend sends settings to http://localhost:8765/api/simulate. The Java backend runs the algorithms and returns results to the existing charts and dashboard.

Important:
- Start the Java backend before clicking Run. If it is not running, the page will show a connection error.
- Use Live Server (not file://) to open the frontend.
- If port 8080 is already in use, stop the other service or change the port in FlowgateServer.java and the URL in js/app.js to match.
- Internet access may be needed for the existing Chart.js CDN script.
- The application is an educational packet-level simulation, not actual video streaming or a complete TCP/UDP stack.

Algorithm flow:
Generated packets -> Java Leaky Bucket -> released packets -> Java TCP-style Go-Back-N and Java UDP-style model -> Java metrics -> existing frontend charts/dashboard.

TCP-style model:
- Sliding sender window, cumulative ACK progression, timeout, Go-Back-N retransmission and retry limit.
UDP-style model:
- One transmission attempt per released packet; no automatic retransmission.
Leaky Bucket:
- Finite queue, burst arrivals, overflow drops and controlled release rate.

Source/destination note:
- The current source/destination selections remain labels and influence deterministic simulation seeding. They do not implement real routing or separate physical link congestion.
