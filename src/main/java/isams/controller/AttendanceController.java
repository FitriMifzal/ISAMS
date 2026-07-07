package isams.controller;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import isams.dao.AttendanceDAO;
import isams.model.Attendance;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet("/AttendanceController")
public class AttendanceController extends HttpServlet {
    private static final long serialVersionUID = 1L;

    public AttendanceController() {
        super();
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        int subId = Integer.parseInt(request.getParameter("subId"));
        int classId = Integer.parseInt(request.getParameter("classId"));
        String date = request.getParameter("date");

        AttendanceDAO dao = new AttendanceDAO();
        List<Attendance> list = dao.getStudentsForAttendance(subId, classId, date);

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        out.print("[");
        for (int i = 0; i < list.size(); i++) {
            Attendance a = list.get(i);
            out.print("{");
            out.print("\"classSessId\":" + a.getClassSessId() + ",");
            out.print("\"studId\":" + a.getStudId() + ",");
            out.print("\"studName\":\"" + escapeJson(a.getStudName()) + "\",");
            out.print("\"studIC\":\"" + escapeJson(a.getStudIC()) + "\",");
            out.print("\"absent\":" + a.isAbsent());
            out.print("}");
            if (i < list.size() - 1) {
                out.print(",");
            }
        }
        out.print("]");
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String date = request.getParameter("date");
        int classSessId = Integer.parseInt(request.getParameter("classSessId"));
        int studId = Integer.parseInt(request.getParameter("studId"));
        boolean absent = Boolean.parseBoolean(request.getParameter("absent"));
        double hours = Double.parseDouble(request.getParameter("hours"));

        AttendanceDAO dao = new AttendanceDAO();
        boolean success;

        if (absent) {
            success = dao.insertAbsent(date, classSessId, studId, hours);
        } else {
            dao.deleteAbsent(classSessId, studId);
            success = true;
        }

        response.setContentType("text/plain");
        if (success) {
            response.getWriter().print("success");
        } else {
            response.getWriter().print("error");
        }
    }

    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}