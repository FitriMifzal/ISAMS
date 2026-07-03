package isams.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import isams.connection.ConnectionManager;
import isams.model.Subject;

/**
 * Author: [YOUR NAME HERE]
 * Student ID: [YOUR STUDENT ID HERE]
 * Date: July 2026
 * Purpose: ISAMS - Subject Data Access Object
 */

public class SubjectDAO {
    // do not remove
    private static Connection con = null;
    private static PreparedStatement ps = null;
    private static ResultSet rs = null;
    private static String sql;

    // insert a new subject (created by PI, no teacher assigned yet)
    public static void addSubject(Subject subject) {
        try {
            con = ConnectionManager.getConnection();

            sql = "INSERT INTO subject(sub_name, creditHours) VALUES(?, ?)";
            ps = con.prepareStatement(sql);

            ps.setString(1, subject.getSubName());
            ps.setInt(2, subject.getCreditHours());

            ps.executeUpdate();

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // update an existing subject's name/credit hours (by PI)
    public static void updateSubject(Subject subject) {
        try {
            con = ConnectionManager.getConnection();

            sql = "UPDATE subject SET sub_name=?, creditHours=? WHERE sub_id=?";
            ps = con.prepareStatement(sql);

            ps.setString(1, subject.getSubName());
            ps.setInt(2, subject.getCreditHours());
            ps.setInt(3, subject.getSubId());

            ps.executeUpdate();

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // a teacher enrolls (claims) a subject - sets t_id
    public static void enrollSubject(int subId, int tId) {
        try {
            con = ConnectionManager.getConnection();

            sql = "UPDATE subject SET t_id=? WHERE sub_id=?";
            ps = con.prepareStatement(sql);

            ps.setInt(1, tId);
            ps.setInt(2, subId);

            ps.executeUpdate();

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // get one subject by id, joined with teacher for display
    public static Subject getSubject(int subId) {
        Subject subject = null;
        try {
            con = ConnectionManager.getConnection();

            sql = "SELECT s.*, t.t_name " +
                  "FROM subject s " +
                  "LEFT JOIN teacher t ON s.t_id = t.t_id " +
                  "WHERE s.sub_id=?";
            ps = con.prepareStatement(sql);
            ps.setInt(1, subId);

            rs = ps.executeQuery();

            if (rs.next()) {
                subject = new Subject();
                subject.setSubId(rs.getInt("sub_id"));
                subject.setSubName(rs.getString("sub_name"));
                subject.setCreditHours(rs.getInt("creditHours"));
                int tId = rs.getInt("t_id");
                subject.setTId(rs.wasNull() ? null : tId);
                subject.setTeacherName(rs.getString("t_name"));
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
        return subject;
    }

    // get all subjects, joined with teacher for display (LEFT JOIN since t_id can be null)
    public static List<Subject> getSubjects() {
        List<Subject> subjects = new ArrayList<Subject>();
        try {
            con = ConnectionManager.getConnection();

            sql = "SELECT s.*, t.t_name " +
                  "FROM subject s " +
                  "LEFT JOIN teacher t ON s.t_id = t.t_id";
            ps = con.prepareStatement(sql);

            rs = ps.executeQuery();

            while (rs.next()) {
                Subject subject = new Subject();
                subject.setSubId(rs.getInt("sub_id"));
                subject.setSubName(rs.getString("sub_name"));
                subject.setCreditHours(rs.getInt("creditHours"));
                int tId = rs.getInt("t_id");
                subject.setTId(rs.wasNull() ? null : tId);
                subject.setTeacherName(rs.getString("t_name"));
                subjects.add(subject);
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
        return subjects;
    }
}
