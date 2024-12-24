import { TextField } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import DateFnsUtils from '@date-io/date-fns';
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import "./styles.css";


const ProductForm = ({ setValues }) => {
    const [form, setForm] = useState({
        name: "",
        date: new Date(),
        nSession: 0,
        validity: 0,
    });

    useEffect(() => {
        setValues(form);
    }, [form]);
    
    return (
        <div>
            {/* <TextField
              autoFocus
              margin="dense"
              style={{ margin: 0, marginBottom: "12px" }}
              label={"name"}
              type="text"
              value={form.name}
              onChange={(event: any) => {
                setForm({ ...form, name: event.target.value})
              }}
              fullWidth
              helperText={"Name"}
            /> */}
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <DatePicker
                    variant="inline"
                    label="Start Date"
                    value={form.date}
                    onChange={value => setForm({ ...form, date: value })}
                />
            </MuiPickersUtilsProvider>
            <TextField
              margin="dense"
              style={{ margin: 0, marginBottom: "12px" }}
              label={"Number of sessions"}
              type="number"
              onChange={(event: any) => {
                setForm({ ...form, nSession: event.target.value })
              }}
              value={form.nSession}
              fullWidth
            />
            <TextField
              margin="dense"
              style={{ margin: 0, marginBottom: "12px" }}
              label={"Validity (number of months)"}
              type="number"
              onChange={(event: any) => {
                setForm({ ...form, validity: event.target.value})
              }}
              value={form.validity}
              fullWidth
            />
        </div>
    );
}

export default ProductForm;