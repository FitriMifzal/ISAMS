package isams.dao;

import java.sql.*;
import java.util.*;
import isams.connection.ConnectionManager;
import isams.model.AttendanceView;

public class AttendanceDAO {

    public int getOrCreateSession(int subId, int classId, String date) {
        int classSessId = 0;

        try {
            Connection con = ConnectionManager.getConnection();

            String checkSql =
                "SELECT CLASS_SESS_ID FROM CLASS_SESSION " +
                "WHERE SUB_ID = ? AND CLASS_ID = ? " +
                "AND SESSION_DATE = TO_DATE(?, 'YYYY-MM-DD')";

            PreparedStatement ps = con.prepareStatement(checkSql);
            ps.setInt(1, subId);
            ps.setInt(2, classId);
            ps.setString(3, date);

            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                classSessId = rs.getInt("CLASS_SESS_ID");
            } else {
                // T_ID diambil dari baris assignment (SESSION_DATE IS NULL)
                String insertSql =
                    "INSERT INTO CLASS_SESSION " +
                    "(SUB_ID, CLASS_ID, SESSION_DATE, SESSION_TIME, T_ID) " +
                    "VALUES (?, ?, TO_DATE(?, 'YYYY-MM-DD'), ?, " +
                    "  (SELECT MIN(T_ID) FROM CLASS_SESSION " +
                    "    WHERE SUB_ID = ? AND CLASS_ID = ? AND SESSION_DATE IS NULL))";

                PreparedStatement ps2 = con.prepareStatement(
                    insertSql,
                    new String[] { "CLASS_SESS_ID" }
                );

                ps2.setInt(1, subId);
                ps2.setInt(2, classId);
                ps2.setString(3, date);
                ps2.setString(4, "-");
                ps2.setInt(5, subId);
                ps2.setInt(6, classId);

                ps2.executeUpdate();

                ResultSet key = ps2.getGeneratedKeys();

                if (key.next()) {
                    classSessId = key.getInt(1);
                }
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return classSessId;
    }

    // students registered for this subject, AND belonging to the selected class
    // returns AttendanceView (DTO), not the Attendance entity
    public List<AttendanceView> getStudentsForAttendance(int subId, int classId, String date) {
        List<AttendanceView> list = new ArrayList<>();

        int classSessId = getOrCreateSession(subId, classId, date);

        String sql =
            "SELECT s.STU_ID, s.STU_NAME, s.STU_IC, a.STU_ID AS ABSENT_STU_ID " +
            "FROM REGISTER r " +
            "JOIN STUDENT s ON r.STU_ID = s.STU_ID " +
            "LEFT JOIN ATTENDANCE a " +
            "ON s.STU_ID = a.STU_ID " +
            "AND a.CLASS_SESS_ID = ? " +
            "WHERE r.SUB_ID = ? " +
            "AND s.CLASS_ID = ? " +
            "ORDER BY s.STU_NAME";

        try {
            Connection con = ConnectionManager.getConnection();

            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, classSessId);
            ps.setInt(2, subId);
            ps.setInt(3, classId);

            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                AttendanceView a = new AttendanceView();

                a.setClassSessId(classSessId);
                a.setStuId(rs.getInt("STU_ID"));
                a.setStuName(rs.getString("STU_NAME"));
                a.setStuIC(rs.getString("STU_IC"));
                a.setAbsent(rs.getString("ABSENT_STU_ID") != null);

                list.add(a);
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }

    public boolean insertAbsent(String date, int classSessId, int studId, double hours) {
        boolean success = false;

        try {
            Connection con = ConnectionManager.getConnection();

            String sql =
                "INSERT INTO ATTENDANCE " +
                "(DATE_RECORDED, CLASS_SESS_ID, STU_ID, ATTENDANCERECORD, HOURS) " +
                "SELECT TO_DATE(?, 'YYYY-MM-DD'), ?, ?, ?, ? " +
                "FROM dual " +
                "WHERE NOT EXISTS ( " +
                "SELECT 1 FROM ATTENDANCE " +
                "WHERE CLASS_SESS_ID = ? " +
                "AND STU_ID = ? " +
                ")";

            PreparedStatement ps = con.prepareStatement(sql);

            ps.setString(1, date);
            ps.setInt(2, classSessId);
            ps.setInt(3, studId);
            ps.setString(4, "Absent");
            ps.setDouble(5, hours);

            ps.setInt(6, classSessId);
            ps.setInt(7, studId);

            int row = ps.executeUpdate();
            success = row > 0;

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return success;
    }

    public void deleteAbsent(int classSessId, int studId) {
        try {
            Connection con = ConnectionManager.getConnection();

            String sql =
                "DELETE FROM ATTENDANCE " +
                "WHERE CLASS_SESS_ID = ? " +
                "AND STU_ID = ?";

            PreparedStatement ps = con.prepareStatement(sql);

            ps.setInt(1, classSessId);
            ps.setInt(2, studId);

            ps.executeUpdate();

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}