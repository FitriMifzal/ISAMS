package isams.model;

public class Attendance {
    private int classSessId;
    private int studId;
    private String studName;
    private String studIC;
    private boolean absent;

    public int getClassSessId() {
        return classSessId;
    }

    public void setClassSessId(int classSessId) {
        this.classSessId = classSessId;
    }

    public int getStudId() {
        return studId;
    }

    public void setStudId(int studId) {
        this.studId = studId;
    }

    public String getStudName() {
        return studName;
    }

    public void setStudName(String studName) {
        this.studName = studName;
    }

    public String getStudIC() {
        return studIC;
    }

    public void setStudIC(String studIC) {
        this.studIC = studIC;
    }

    public boolean isAbsent() {
        return absent;
    }

    public void setAbsent(boolean absent) {
        this.absent = absent;
    }
}