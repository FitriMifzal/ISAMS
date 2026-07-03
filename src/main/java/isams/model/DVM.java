package isams.model;

public class DVM extends Student {
    private static final long serialVersionUID = 1L;

    private String repeatPaper;

    public DVM() {
        super();
    }

    public String getRepeatPaper() {
        return repeatPaper;
    }

    public void setRepeatPaper(String repeatPaper) {
        this.repeatPaper = repeatPaper;
    }
}
