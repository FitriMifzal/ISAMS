package isams.model;

import java.io.Serializable;

public class Subject implements Serializable {
	private static final long serialVersionUID = 1L;
	
	private int subId;
    private String subName;
    private int creditHours;
    private int tId;

    public Subject() {
    }

    public int getSubId() {
        return subId;
    }

    public void setSubId(int subId) {
        this.subId = subId;
    }

    public String getSubName() {
        return subName;
    }

    public void setSubName(String subName) {
        this.subName = subName;
    }

    public int getCreditHours() {
        return creditHours;
    }

    public void setCreditHours(int creditHours) {
        this.creditHours = creditHours;
    }

    public int getTId() {
        return tId;
    }

    public void setTId(int tId) {
        this.tId = tId;
    }
}
