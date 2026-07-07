package isams.dao;

import java.sql.*;
import java.util.*;
import isams.connection.ConnectionManager;
import isams.model.AbsentRecord;

public class AbsentRecordDAO {

	public static List<AbsentRecord> getAbsentRecordList(int classId, int subId) {
        List<AbsentRecord> list = new ArrayList<>();

        String sql =
            "SELECT s.STUD_ID, s.STUD_NAME, s.STUD_IC, " +
            "sub.SUB_ID, sub.SUB_NAME, sub.CREDITHOURS, " +
            "NVL(SUM(a.ATTENDANCERECORD),0) AS ABSENT_HOURS " +
            "FROM REGISTER r " +
            "JOIN STUDENT s ON r.STUD_ID = s.STUD_ID " +
            "JOIN SUBJECT sub ON r.SUB_ID = sub.SUB_ID " +
            "LEFT JOIN ATTENDANCE a ON a.STUD_ID = s.STUD_ID " +
            "AND a.CLASS_ID = r.CLASS_ID " +
            "AND a.CLASS_SESS_ID IN ( " +
            "    SELECT cs.CLASS_SESS_ID FROM CLASS_SESSION cs " +
            "    WHERE cs.SUB_ID = r.SUB_ID AND cs.CLASS_ID = r.CLASS_ID " +
            ") " +
            "WHERE r.CLASS_ID = ? AND r.SUB_ID = ? " +
            "GROUP BY s.STUD_ID, s.STUD_NAME, s.STUD_IC, sub.SUB_ID, sub.SUB_NAME, sub.CREDITHOURS " +
            "ORDER BY s.STUD_NAME";

        try {
            Connection con = ConnectionManager.getConnection();
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, classId);
            ps.setInt(2, subId);
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                AbsentRecord ap = new AbsentRecord();

                int totalHours = rs.getInt("CREDITHOURS");
                double absentHours = rs.getDouble("ABSENT_HOURS");
                double attendedHours = totalHours - absentHours;

                double attendanceRate = 0;
                if (totalHours > 0) {
                    attendanceRate = ((double) attendedHours / totalHours) * 100;
                }

                double absentRate = 100 - attendanceRate;

                ap.setStudId(rs.getInt("STUD_ID"));
                ap.setStudName(rs.getString("STUD_NAME"));
                ap.setStudIC(rs.getString("STUD_IC"));
                ap.setSubId(rs.getInt("SUB_ID"));
                ap.setSubName(rs.getString("SUB_NAME"));
                ap.setTotalHours(totalHours);
                ap.setAbsentHours(absentHours);
                ap.setAttendedHours(attendedHours);
                ap.setAttendanceRate(attendanceRate);
                ap.setBarred(absentRate >= 20);

                list.add(ap);
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }
}