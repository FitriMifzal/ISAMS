package isams.controller;

import java.io.*;
import java.util.*;
import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import isams.dao.AbsentRecordDAO;
import isams.model.AbsentRecord;

@WebServlet("/AbsentRecordController")
public class AbsentRecordController extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

    	int classId = Integer.parseInt(request.getParameter("classId"));
    	int subId = Integer.parseInt(request.getParameter("subId"));

    	List<AbsentRecord> list = AbsentRecordDAO.getAbsentRecordList(classId, subId);

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        PrintWriter out = response.getWriter();

        out.print("[");
        for (int i = 0; i < list.size(); i++) {
            AbsentRecord a = list.get(i);

            out.print("{");
            out.print("\"studId\":" + a.getStudId() + ",");
            out.print("\"studName\":\"" + escapeJson(a.getStudName()) + "\",");
            out.print("\"studIC\":\"" + escapeJson(a.getStudIC()) + "\",");
            out.print("\"subId\":" + a.getSubId() + ",");
            out.print("\"subName\":\"" + escapeJson(a.getSubName()) + "\",");
            out.print("\"totalHours\":" + a.getTotalHours() + ",");
            out.print("\"attendedHours\":" + a.getAttendedHours() + ",");
            out.print("\"absentHours\":" + a.getAbsentHours() + ",");
            out.print("\"attendanceRate\":" + String.format("%.1f", a.getAttendanceRate()) + ",");
            out.print("\"barred\":" + a.isBarred());
            out.print("}");

            if (i < list.size() - 1) {
                out.print(",");
            }
        }
        out.print("]");
    }

    private String escapeJson(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}