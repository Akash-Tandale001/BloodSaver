import React, { useEffect, useState } from "react";
import "./DonorDashboard.css";
import Sidebar from "../Sidebar";
import Header from "../Header";
import { LinearProgress } from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const DonorDashboard = () => {
  const sidebarProp = {
    home: true,
    historyReciever: false,
    rewards: false,
    donor: true,
    recieverPage: false,
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

  const [donorData, setDonorData] = useState({
    level: 0,
    donation_required_to_reach_next_level: 0,
  });

  const url = "http://35.244.15.171:8000";
  const [response, setResponse] = useState(null);
  const navigate = useNavigate();

  const fetchPendingRequests = async (donor_id) => {
    try {
      let { data } = await axios.post(
        `${url}/donation/pending-request-list/`,
        {
          donor_id: donor_id,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setResponse(data);
    } catch (error) {
      console.log(error);
      if (error.response.status === 400) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong!");
      }
    }
  };

  const fetchDonorData = async (donor_id) => {
    try {
      const { data } = await axios.get(`${url}/donor/profile/${donor_id}`);
      setDonorData(data);
      // console.log(donorData);
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    const donor_id = localStorage.getItem("donor_id");

    if (donor_id === "null") {
      toast.error("You haven't registered for donor yet!");
      navigate("/", { replace: true });
      return;
    } else {
      fetchPendingRequests(donor_id);
      fetchDonorData(donor_id);
    }
  }, []);

  return (
    <div className="donorPageConatiner">
      <div className="donorPageConatinerLeft">
        <Sidebar {...sidebarProp} />
      </div>
      <div className="donorPageConatinerRight">
        <div className="donorHeader">
          <Header />
        </div>
        <div className="donorBody">
          <div className="donor-body-top">
            <div className="pending-requests">
              <h3>Donation Requests </h3>
              <div className="requests-box">
                {response && response.length !== 0 ? (
                  response.map((item) => (
                    <div className="donation-card" key={item.request_id}>
                      <div className="d-card-content">
                        <h5>
                          {item.requested_by.first_name +
                            " " +
                            item.requested_by.last_name}
                        </h5>
                        <h5>{item.phone_number}</h5>
                        <h5>{item.blood_group}</h5>
                        <h5>{item.units_required} Units</h5>
                        <h5>1.3km away</h5>
                        <h5 className="tag">{item.required_on}</h5>
                        <h5>{item.place_of_donation}</h5>
                      </div>
                      <div className="d-card-button">
                        <button>Accept</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <h1>No pending requests</h1>
                )}
              </div>
            </div>
            <div className="level-card">
              <h3>Profile Level</h3>
              <div className="level-card-box">
                <h5>Level</h5>
                <h1>{donorData.level}</h1>
                <p>
                  {donorData.donation_required_to_reach_next_level} more
                  donations to next level
                </p>
                <LinearProgress variant="determinate" value={50} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
