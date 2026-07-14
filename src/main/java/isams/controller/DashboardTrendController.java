package isams.controller;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Locale;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import isams.dao.DashboardDAO;
import isams.model.AttendanceTrend;

@WebServlet("/DashboardTrendController")
public class DashboardTrendController extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String piIdParam = request.getParameter("piId");

        if (piIdParam == null || piIdParam.isEmpty()) {
            out.print("{\"status\":\"error\", \"message\":\"Missing piId parameter\"}");
            return;
        }

        int piId;
        try {
            piId = Integer.parseInt(piIdParam);
        } catch (NumberFormatException e) {
            out.print("{\"status\":\"error\", \"message\":\"Invalid piId parameter\"}");
            return;
        }

        List<AttendanceTrend> trend = DashboardDAO.getAttendanceTrendByPi(piId);

        StringBuilder json = new StringBuilder();
        json.append("[");
        for (int i = 0; i < trend.size(); i++) {
            AttendanceTrend t = trend.get(i);
            json.append("{");
            json.append("\"date\":\"").append(t.getDate()).append("\",");
            json.append("\"totalStudents\":").append(t.getTotalStudents()).append(",");
            json.append("\"presentCount\":").append(t.getPresentCount()).append(",");
            json.append("\"absentCount\":").append(t.getAbsentCount()).append(",");
            json.append("\"percentage\":").append(String.format(Locale.US, "%.1f", t.getPercentage()));
            json.append("}");
            if (i < trend.size() - 1) {
                json.append(",");
            }
        }
        json.append("]");

        out.print(json.toString());
        out.flush();
    }
}