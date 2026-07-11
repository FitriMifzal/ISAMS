package isams.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import isams.connection.ConnectionManager;

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
}