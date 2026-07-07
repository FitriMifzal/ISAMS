package isams.model;

public class AbsentRecord {
    private int studId;
    private String studName;
    private String studIC;
    private int subId;
    private String subName;
    private int totalHours;
    private double absentHours;
    private double attendedHours;
    private double attendanceRate;
    private boolean barred;

    public int getStudId() { return studId; }
    public void setStudId(int studId) { this.studId = studId; }

    public String getStudName() { return studName; }
    public void setStudName(String studName) { this.studName = studName; }

    public String getStudIC() { return studIC; }
    public void setStudIC(String studIC) { this.studIC = studIC; }

    public int getSubId() { return subId; }
    public void setSubId(int subId) { this.subId = subId; }

    public String getSubName() { return subName; }
    public void setSubName(String subName) { this.subName = subName; }

    public int getTotalHours() { return totalHours; }
    public void setTotalHours(int totalHours) { this.totalHours = totalHours; }

    public double getAbsentHours() { return absentHours; }
    public void setAbsentHours(double absentHours) { this.absentHours = absentHours; }

    public double getAttendedHours() { return attendedHours; }
    public void setAttendedHours(double attendedHours) { this.attendedHours = attendedHours; }

    public double getAttendanceRate() { return attendanceRate; }
    public void setAttendanceRate(double attendanceRate) { this.attendanceRate = attendanceRate; }

    public boolean isBarred() { return barred; }
    public void setBarred(boolean barred) { this.barred = barred; }
}