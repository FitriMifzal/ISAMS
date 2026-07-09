package isams.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import isams.connection.ConnectionManager;
import isams.model.Teacher;

public class TeacherDAO {
    // do not remove
    private static Connection con = null;
    private static PreparedStatement ps = null;
    private static ResultSet rs = null;
    private static String sql;

    // insert a new teacher (used by Create Account)
    public static void addTeacher(Teacher teacher) {
        try {
            con = ConnectionManager.getConnection();

            sql = "INSERT INTO teacher(t_name, t_ic, t_phonenum, t_email, t_pass) VALUES(?, ?, ?, ?, ?)";
            ps = con.prepareStatement(sql);

            ps.setString(1, teacher.getTName());
            ps.setString(2, teacher.getTIC());
            ps.setString(3, teacher.getTPhoneNum());
            ps.setString(4, teacher.getTEmail());
            ps.setString(5, teacher.getTPass());

            ps.executeUpdate();

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // check login credentials, return the matching Teacher or null
    public static Teacher loginTeacher(String tIC, String tPass) {
        Teacher teacher = null;

        String sql = "SELECT * FROM TEACHER "
                   + "WHERE T_IC = ? "
                   + "AND T_PASS = ? "
                   + "AND PI_ID IS NULL "
                   + "AND STATUS = 'ACTIVE'";

        try (
            Connection con = ConnectionManager.getConnection();
            PreparedStatement ps = con.prepareStatement(sql)
        ) {
            ps.setString(1, tIC);
            ps.setString(2, tPass);

            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                teacher = mapTeacher(rs);
                teacher.setRole("Teacher");
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return teacher;
    }

    public static Teacher loginPI(String piId, String tPass) {
        Teacher teacher = null;

        String sql = "SELECT * FROM TEACHER "
                   + "WHERE PI_ID = ? "
                   + "AND T_PASS = ? "
                   + "AND PI_ID IS NOT NULL "
                   + "AND STATUS = 'ACTIVE'";

        try (
            Connection con = ConnectionManager.getConnection();
            PreparedStatement ps = con.prepareStatement(sql)
        ) {
            ps.setInt(1, Integer.parseInt(piId));
            ps.setString(2, tPass);

            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                teacher = mapTeacher(rs);
                teacher.setRole("Penyelaras Intervensi");
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return teacher;
    }

    private static Teacher mapTeacher(ResultSet rs) throws Exception {
        Teacher teacher = new Teacher();

        teacher.setTId(rs.getInt("T_ID"));
        teacher.setTName(rs.getString("T_NAME"));
        teacher.setTIC(rs.getString("T_IC"));
        teacher.setTPhoneNum(rs.getString("T_PHONENUM"));
        teacher.setTEmail(rs.getString("T_EMAIL"));
        teacher.setTPass(rs.getString("T_PASS"));
        teacher.setStatus(rs.getString("STATUS"));

        int piId = rs.getInt("PI_ID");

        if (rs.wasNull()) {
            teacher.setPiId(null);
        } else {
            teacher.setPiId(piId);
        }

        return teacher;
    }
    // archive a teacher account (soft delete - keeps data, disables access)
    public static void archiveTeacher(int tId) {
        try {
            con = ConnectionManager.getConnection();

            sql = "UPDATE teacher SET status='ARCHIVED' WHERE t_id=?";
            ps = con.prepareStatement(sql);
            ps.setInt(1, tId);

            ps.executeUpdate();

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // get all teachers (used for dropdowns / display)
    public static List<Teacher> getTeachers() {
        List<Teacher> teachers = new ArrayList<Teacher>();
        try {
            con = ConnectionManager.getConnection();

            sql = "SELECT * FROM teacher";
            ps = con.prepareStatement(sql);

            rs = ps.executeQuery();

            while (rs.next()) {
                Teacher teacher = new Teacher();
                teacher.setTId(rs.getInt("t_id"));
                teacher.setTName(rs.getString("t_name"));
                teacher.setTIC(rs.getString("t_ic"));
                teacher.setTPhoneNum(rs.getString("t_phonenum"));
                teacher.setTEmail(rs.getString("t_email"));
                teacher.setStatus(rs.getString("status"));
                teachers.add(teacher);
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
        return teachers;
    }

    // check if an IC is already registered
    public static boolean icExists(String ic) {
        boolean exists = false;
        try {
            con = ConnectionManager.getConnection();

            sql = "SELECT COUNT(*) FROM teacher WHERE t_ic=?";
            ps = con.prepareStatement(sql);
            ps.setString(1, ic);

            rs = ps.executeQuery();

            if (rs.next()) {
                exists = rs.getInt(1) > 0;
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
        return exists;
    }
}