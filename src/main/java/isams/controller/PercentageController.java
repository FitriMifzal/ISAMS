package isams.controller;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import isams.dao.PercentageDAO;
import isams.model.AbsentRecord;

/**
 * Author: [YOUR NAME HERE]
 * Student ID: [YOUR STUDENT ID HERE]
 * Date: July 2026
 * Purpose: ISAMS - Handles Calculate Absent Percentage requests.
 *
 * GET ?action=calculate&subId=1&classId=2 -> JSON array of AbsentRecord data
 */
@WebServlet("/PercentageController")
public class PercentageController extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        PrintWriter out = response.getWriter();

        String action = request.getParameter("action");

        if ("calculate".equals(action)) {
            handleCalculate(request, out);
        } else {
            out.print("{\"status\":\"error\", \"message\":\"Unknown or missing action\"}");
        }

        out.flush();
    }

    private void handleCalculate(HttpServletRequest request, PrintWriter out) {
        try {
            int subId = Integer.parseInt(request.getParameter("subId"));
            int classId = Integer.parseInt(request.getParameter("classId"));

            List<AbsentRecord> records = PercentageDAO.calculatePercentage(subId, classId);

            StringBuilder json = new StringBuilder();
            json.append("[");
            for (int i = 0; i < records.size(); i++) {
                json.append(toJson(records.get(i)));
                if (i < records.size() - 1) {
                    json.append(",");
                }
            }
            json.append("]");

            out.print(json.toString());

        } catch (NumberFormatException e) {
            out.print("{\"status\":\"error\", \"message\":\"Invalid subId or classId\"}");
        }
    }

    private String toJson(AbsentRecord r) {
        StringBuilder json = new StringBuilder();
        json.append("{");
        json.append("\"studId\":").append(r.getStudId()).append(",");
        json.append("\"studName\":\"").append(escape(r.getStudName())).append("\",");
        json.append("\"studIC\":\"").append(escape(r.getStudIC())).append("\",");
        json.append("\"subName\":\"").append(escape(r.getSubName())).append("\",");
        json.append("\"totalHours\":").append(r.getTotalHours()).append(",");
        json.append("\"absentHours\":").append(r.getAbsentHours()).append(",");
        json.append("\"attendedHours\":").append(r.getAttendedHours()).append(",");
        json.append("\"attendanceRate\":").append(r.getAttendanceRate()).append(",");
        json.append("\"barred\":").append(r.isBarred());
        json.append("}");
        return json.toString();
    }

    private String escape(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}