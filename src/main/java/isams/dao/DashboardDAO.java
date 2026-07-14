package isams.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

import isams.connection.ConnectionManager;
import isams.model.AttendanceTrend;

/**
 * Author: [YOUR NAME HERE]
 * Student ID: [YOUR STUDENT ID HERE]
 * Date: July 2026
 * Purpose: ISAMS - Dashboard statistics queries
 */

public class DashboardDAO {

    // number of DISTINCT classes this teacher actually teaches
    // (a class counts if it has a class_session tied to one of this teacher's subjects)
    public static int getTotalClassesForTeacher(int tId) {
        int count = 0;
        try {
            Connection con = ConnectionManager.getConnection();
            String sql =
                "SELECT COUNT(DISTINCT cs.class_id) " +
                "FROM class_session cs " +
                "JOIN subject s ON cs.sub_id = s.sub_id " +
                "WHERE s.t_id = ?";
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, tId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                count = rs.getInt(1);
            }
            con.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return count;
    }

    // number of DISTINCT students belonging to any class this teacher teaches
    public static int getTotalStudentsForTeacher(int tId) {
        int count = 0;
        try {
            Connection con = ConnectionManager.getConnection();
            String sql =
                "SELECT COUNT(DISTINCT st.stu_id) " +
                "FROM student st " +
                "WHERE st.class_id IN ( " +
                "SELECT DISTINCT cs.class_id " +
                "FROM class_session cs " +
                "JOIN subject s ON cs.sub_id = s.sub_id " +
                "WHERE s.t_id = ? " +
                ")";
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, tId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                count = rs.getInt(1);
            }
            con.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return count;
    }

    // number of subjects assigned to a specific teacher
    public static int getTotalSubjectsForTeacher(int tId) {
        int count = 0;
        try {
            Connection con = ConnectionManager.getConnection();
            String sql = "SELECT COUNT(*) FROM subject WHERE t_id = ?";
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, tId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                count = rs.getInt(1);
            }
            con.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return count;
    }
    
    public static List<AttendanceTrend> getAttendanceTrendByPi(int piId) {
        List<AttendanceTrend> trend = new ArrayList<AttendanceTrend>();
 
        // TO_CHAR works identically on Oracle and Postgres - keeps date format consistent
        // across both environments without needing a Java-side date formatter
        String sql =
            "SELECT TO_CHAR(cs.session_date, 'YYYY-MM-DD') AS session_date, " +
            "       COUNT(DISTINCT r.stu_id) AS total_students, " +
            "       COUNT(DISTINCT a.stu_id) AS absent_count " +
            "FROM class_session cs " +
            "JOIN teacher t ON cs.t_id = t.t_id " +
            "JOIN subject sub ON cs.sub_id = sub.sub_id " +
            "JOIN register r ON r.sub_id = sub.sub_id " +
            "JOIN student s ON s.stu_id = r.stu_id AND s.class_id = cs.class_id " +
            "LEFT JOIN attendance a ON a.class_sess_id = cs.class_sess_id AND a.stu_id = s.stu_id " +
            "WHERE cs.session_date IS NOT NULL " +
            "AND t.pi_id = ? " +
            "GROUP BY cs.session_date " +
            "ORDER BY cs.session_date";
 
        try {
            Connection con = ConnectionManager.getConnection();
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, piId);
 
            ResultSet rs = ps.executeQuery();
 
            while (rs.next()) {
                AttendanceTrend row = new AttendanceTrend();
 
                row.setDate(rs.getString("session_date"));
 
                int total = rs.getInt("total_students");
                int absent = rs.getInt("absent_count");
                int present = total - absent;
 
                double percentage = 0;
                if (total > 0) {
                    percentage = (present / (double) total) * 100;
                }
 
                row.setTotalStudents(total);
                row.setAbsentCount(absent);
                row.setPresentCount(present);
                row.setPercentage(percentage);
 
                trend.add(row);
            }
 
            con.close();
 
        } catch (Exception e) {
            e.printStackTrace();
        }
 
        return trend;
    }

    
}