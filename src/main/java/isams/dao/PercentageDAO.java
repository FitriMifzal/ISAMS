package isams.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import isams.connection.ConnectionManager;
import isams.model.AbsentRecord;

/**
 * Author: [YOUR NAME HERE]
 * Student ID: [YOUR STUDENT ID HERE]
 * Date: July 2026
 * Purpose: ISAMS - Calculates attendance percentage per student,
 * for a given Subject + Class. Backs the "Calculate Absent
 * Percentage" feature and its graph.
 */
public class PercentageDAO {

    // students below this attendance rate get flagged as "barred"
    private static final double BARRED_THRESHOLD = 80.0;

    public static List<AbsentRecord> calculatePercentage(int subId, int classId) {
        List<AbsentRecord> records = new ArrayList<AbsentRecord>();

        try {
            Connection con = ConnectionManager.getConnection();

            // 1. how many actual dated sessions have happened for this
            //    subject+class, and what does the subject weigh per session
            int totalSessions = 0;
            int creditHours = 0;

            String sessionSql =
                "SELECT COUNT(*) AS session_count, MAX(sub.creditHours) AS credit_hours " +
                "FROM class_session cs " +
                "JOIN subject sub ON cs.sub_id = sub.sub_id " +
                "WHERE cs.sub_id = ? AND cs.class_id = ? AND cs.session_date IS NOT NULL";

            PreparedStatement ps1 = con.prepareStatement(sessionSql);
            ps1.setInt(1, subId);
            ps1.setInt(2, classId);
            ResultSet rs1 = ps1.executeQuery();

            if (rs1.next()) {
                totalSessions = rs1.getInt("session_count");
                creditHours = rs1.getInt("credit_hours");
            }

            int totalHours = totalSessions * creditHours;

            // 2. every student registered for this subject, belonging to this class
            String studentSql =
                "SELECT s.stu_id, s.stu_name, s.stu_ic " +
                "FROM register r " +
                "JOIN student s ON r.stu_id = s.stu_id " +
                "WHERE r.sub_id = ? AND s.class_id = ? " +
                "ORDER BY s.stu_name";

            PreparedStatement ps2 = con.prepareStatement(studentSql);
            ps2.setInt(1, subId);
            ps2.setInt(2, classId);
            ResultSet rs2 = ps2.executeQuery();

            String subName = getSubjectName(con, subId);

            while (rs2.next()) {
                int stuId = rs2.getInt("stu_id");
                String stuName = rs2.getString("stu_name");
                String stuIC = rs2.getString("stu_ic");

                // 3. how many hours has THIS student been absent for,
                //    across all dated sessions of this subject+class
                double absentHours = getAbsentHours(con, stuId, subId, classId);
                double attendedHours = totalHours - absentHours;

                double attendanceRate;
                if (totalHours == 0) {
                    attendanceRate = 100.0; // no sessions taken yet - nothing to penalize
                } else {
                    attendanceRate = (attendedHours / totalHours) * 100.0;
                }

                AbsentRecord record = new AbsentRecord();
                record.setStudId(stuId);
                record.setStudName(stuName);
                record.setStudIC(stuIC);
                record.setSubId(subId);
                record.setSubName(subName);
                record.setTotalHours(totalHours);
                record.setAbsentHours(absentHours);
                record.setAttendedHours(attendedHours);
                record.setAttendanceRate(attendanceRate);
                record.setBarred(attendanceRate < BARRED_THRESHOLD);

                records.add(record);
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return records;
    }

    // sums a student's absent hours across every dated session of this subject+class
    private static double getAbsentHours(Connection con, int stuId, int subId, int classId) throws Exception {
        String sql =
            "SELECT NVL(SUM(a.hours), 0) AS total_absent " +
            "FROM attendance a " +
            "JOIN class_session cs ON a.class_sess_id = cs.class_sess_id " +
            "WHERE a.stu_id = ? AND cs.sub_id = ? AND cs.class_id = ?";

        PreparedStatement ps = con.prepareStatement(sql);
        ps.setInt(1, stuId);
        ps.setInt(2, subId);
        ps.setInt(3, classId);

        ResultSet rs = ps.executeQuery();
        double total = 0;
        if (rs.next()) {
            total = rs.getDouble("total_absent");
        }
        return total;
    }

    private static String getSubjectName(Connection con, int subId) throws Exception {
        String sql = "SELECT sub_name FROM subject WHERE sub_id = ?";
        PreparedStatement ps = con.prepareStatement(sql);
        ps.setInt(1, subId);
        ResultSet rs = ps.executeQuery();
        if (rs.next()) {
            return rs.getString("sub_name");
        }
        return "";
    }
}
