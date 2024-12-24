import { Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Button } from "@material-ui/core";

const PopupDialog = ({ open, title, description, handleClose, handleSubmit }) => {
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
            {title}
            </DialogTitle>
            <DialogContent>
            <DialogContentText id="alert-dialog-description">
                {description}
            </DialogContentText>
            </DialogContent>
            <DialogActions>
            <Button onClick={handleClose}>CANCEL</Button>
            <Button onClick={handleSubmit} autoFocus>
                YES
            </Button>
            </DialogActions>
        </Dialog>
    )
}

export default PopupDialog;