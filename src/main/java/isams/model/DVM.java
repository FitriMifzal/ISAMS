package isams.model;

public class DVM extends Student {
    private static final long serialVersionUID = 1L;

    private int repeatPaper;

    public DVM() {
        super();
    }

    public int getRepeatPaper() {
        return repeatPaper;
    }

    public void setRepeatPaper(int repeatPaper) {
        this.repeatPaper = repeatPaper;
    }
}
