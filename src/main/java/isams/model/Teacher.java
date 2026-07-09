package isams.model;

import java.io.Serializable;

public class Teacher implements Serializable {
    private static final long serialVersionUID = 1L;

    private int tId;
    private String tName;
    private String tIC;
    private String tPhoneNum;
    private String tEmail;
    private String tPass;
    private Integer piId;
    private String status;
    private String role;

    public Teacher() {
    }

    public int getTId() {
        return tId;
    }

    public void setTId(int tId) {
        this.tId = tId;
    }

    public String getTName() {
        return tName;
    }

    public void setTName(String tName) {
        this.tName = tName;
    }

    public String getTIC() {
        return tIC;
    }

    public void setTIC(String tIC) {
        this.tIC = tIC;
    }

    public String getTPhoneNum() {
        return tPhoneNum;
    }

    public void setTPhoneNum(String tPhoneNum) {
        this.tPhoneNum = tPhoneNum;
    }

    public String getTEmail() {
        return tEmail;
    }

    public void setTEmail(String tEmail) {
        this.tEmail = tEmail;
    }

    public String getTPass() {
        return tPass;
    }

    public void setTPass(String tPass) {
        this.tPass = tPass;
    }

    public Integer getPiId() {
        return piId;
    }

    public void setPiId(Integer piId) {
        this.piId = piId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}