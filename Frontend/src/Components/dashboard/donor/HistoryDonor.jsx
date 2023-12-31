import React from "react";
import Sidebar from "../Sidebar";
import Header from "../Header";
import "./HistoryDonor.css";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const HistoryDonor = () => {
  const [data, setData] = useState([]);
  const sidebarProp = {
    home: false,
    historyDonor: true,
    rewards: false,
    donor: true,
    active: {
      padding: "20px",
      border: "none",
      textAlign: "center",
      color: "white",
      borderRadius: "20px",
      backgroundColor: "rgba(255, 255, 255, 0.383)",
      cursor: "pointer",
    },
  };

  const navigate = useNavigate();
  const url = "http://35.244.15.171:8000";
  // donor window
  const fetchDonorHistory = async (user_id) => {
    try {
      let { data } = await axios.post(
        `${url}/donation/donor-history/`,
        {
          donor_id: user_id,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setData(data);
      console.log("Data", data);
      if (!data || data.length === 0) {
        toast.warn("No history found at the moment!");
      }
    } catch (error) {
      console.log(error);
      if (error.response.status === 400) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong!");
      }
    }
  };

  useEffect(() => {
    let donor_id = localStorage.getItem("donor_id");
    console.log("Donor id", donor_id);
    if (donor_id !== null) {
      console.log("calling api");
      fetchDonorHistory(donor_id);
    } else {
      toast.error("Donor not found!");
      navigate("/");
    }
  }, []);

  return (
    <div className="historyContainer">
      <div className="historyLeft">
        <Sidebar {...sidebarProp} />
      </div>
      <div className="historyRight">
        <div className="headerBox">
          <Header />
        </div>
        <div className="historyTable">
          <TableContainer component={Paper} sx={{ borderRadius: "20px" }}>
            <Table
              sx={{ minWidth: 650 }}
              size="Large"
              aria-label="a dense table"
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    align="left"
                    sx={{ fontSize: 16, fontWeight: 700 }}
                  >
                    Reciever
                  </TableCell>
                  <TableCell
                    align="left"
                    sx={{ fontSize: 16, fontWeight: 700 }}
                  >
                    Blood Group
                  </TableCell>
                  <TableCell
                    align="left"
                    className="tableHead"
                    sx={{ fontSize: 16, fontWeight: 700 }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    align="left"
                    className="tableHead"
                    sx={{ fontSize: 16, fontWeight: 700 }}
                  >
                    Units
                  </TableCell>
                  <TableCell
                    align="left"
                    className="tableHead"
                    sx={{ fontSize: 16, fontWeight: 700 }}
                  >
                    Date of Donation
                  </TableCell>
                  <TableCell
                    align="left"
                    className="tableHead"
                    sx={{ fontSize: 16, fontWeight: 700 }}
                  >
                    Date of request
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data && data.length !== 0 ? (
                  data.map((data) => (
                    <TableRow
                      key={data.request_id}
                      sx={{
                        "&:last-child td, &:last-child th": {
                          border: 0,
                        },
                      }}
                      className="coloredBg"
                    >
                      <TableCell component="th" scope="row">
                        {data.current_status === "fullfilled" ||
                        data.current_status === "active"
                          ? data.donor_id.user.first_name +
                            " " +
                            data.donor_id.user.last_name
                          : "--"}
                      </TableCell>
                      <TableCell align="left">{data.blood_group}</TableCell>
                      <TableCell align="left">{data.current_status}</TableCell>
                      <TableCell align="left">{data.units_required}</TableCell>
                      <TableCell align="left">--</TableCell>
                      <TableCell align="left">
                        {data.required_on.slice(0, 16)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow
                    sx={{
                      "&:last-child td, &:last-child th": {
                        border: 0,
                      },
                    }}
                    className="coloredBg"
                  >
                    <TableCell component="th" scope="row">
                      --
                    </TableCell>
                    <TableCell align="left">--</TableCell>
                    <TableCell align="left">--</TableCell>
                    <TableCell align="left">--</TableCell>
                    <TableCell align="left">--</TableCell>
                    <TableCell align="left">--</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    </div>
  );
};

export default HistoryDonor;
