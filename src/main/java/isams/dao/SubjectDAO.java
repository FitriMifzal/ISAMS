package isams.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

import isams.connection.ConnectionManager;
import isams.model.Subject;

/**
 * NOTE: t_id was removed from subject entirely. Subject is now purely
 * about its own data (name, credit hours). Teacher assignment happens
 * exclusively through class_session (subject + class + teacher together),
 * via enrollTeacher() / getAssignmentsJson() below.
 */
public class SubjectDAO {

    private static Connection con = null;
    private static PreparedStatement ps = null;
    private static ResultSet rs = null;
    private static String sql;

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

    // get one subject by id - no teacher info here anymore, that's
    // now only available via getAssignmentsJson()
    public static Subject getSubject(int subId) {
        Subject subject = null;
        try {
            con = ConnectionManager.getConnection();
            sql = "SELECT * FROM subject WHERE sub_id=?";
            ps = con.prepareStatement(sql);
            ps.setInt(1, subId);
            rs = ps.executeQuery();
            if (rs.next()) {
                subject = new Subject();
                subject.setSubId(rs.getInt("sub_id"));
                subject.setSubName(rs.getString("sub_name"));
                subject.setCreditHours(rs.getInt("creditHours"));
            }
            con.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return subject;
    }

    // get all subjects - no teacher info here anymore
    public static List<Subject> getSubjects() {
        List<Subject> subjects = new ArrayList<Subject>();
        try {
            con = ConnectionManager.getConnection();
            sql = "SELECT * FROM subject";
            ps = con.prepareStatement(sql);
            rs = ps.executeQuery();
            while (rs.next()) {
                Subject subject = new Subject();
                subject.setSubId(rs.getInt("sub_id"));
                subject.setSubName(rs.getString("sub_name"));
                subject.setCreditHours(rs.getInt("creditHours"));
                subjects.add(subject);
            }
            con.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return subjects;
    }

    // teacher enrolls to teach a subject for a specific class
    // creates an assignment row in class_session (session_date = NULL)
    public static boolean enrollTeacher(int subId, int classId, int tId) {
        try {
            con = ConnectionManager.getConnection();
            sql = "INSERT INTO class_session(sub_id, class_id, t_id, session_date) " +
                  "SELECT ?, ?, ?, NULL FROM dual " +
                  "WHERE NOT EXISTS (SELECT 1 FROM class_session " +
                  "  WHERE sub_id=? AND class_id=? AND t_id=? AND session_date IS NULL)";
            ps = con.prepareStatement(sql);
            ps.setInt(1, subId);
            ps.setInt(2, classId);
            ps.setInt(3, tId);
            ps.setInt(4, subId);
            ps.setInt(5, classId);
            ps.setInt(6, tId);
            int row = ps.executeUpdate();
            con.close();
            return row > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    // all teaching assignments (subject + class + teacher) - this is now
    // the ONLY source of "which teacher teaches which subject"
    public static List<String> getAssignmentsJson() {
        List<String> list = new ArrayList<String>();
        try {
            con = ConnectionManager.getConnection();
            sql = "SELECT DISTINCT cs.sub_id, cs.class_id, cs.t_id, " +
                  "       t.t_name, s.sub_name, c.classcode, c.class_name " +
                  "FROM class_session cs " +
                  "JOIN teacher t   ON cs.t_id = t.t_id " +
                  "JOIN subject s   ON cs.sub_id = s.sub_id " +
                  "JOIN classroom c ON cs.class_id = c.class_id " +
                  "WHERE cs.t_id IS NOT NULL";
            ps = con.prepareStatement(sql);
            rs = ps.executeQuery();
            while (rs.next()) {
                StringBuilder j = new StringBuilder();
                j.append("{");
                j.append("\"subId\":").append(rs.getInt("sub_id")).append(",");
                j.append("\"classId\":").append(rs.getInt("class_id")).append(",");
                j.append("\"tId\":").append(rs.getInt("t_id")).append(",");
                j.append("\"teacherName\":\"").append(safe(rs.getString("t_name"))).append("\",");
                j.append("\"subName\":\"").append(safe(rs.getString("sub_name"))).append("\",");
                j.append("\"classCode\":\"").append(safe(rs.getString("classcode"))).append("\",");
                j.append("\"className\":\"").append(safe(rs.getString("class_name"))).append("\"");
                j.append("}");
                list.add(j.toString());
            }
            con.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    private static String safe(String v) {
        if (v == null) return "";
        return v.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}