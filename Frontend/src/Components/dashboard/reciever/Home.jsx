import React from "react";
import "./Home.css";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import Header from "../Header";
import Sidebar from "../Sidebar";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LoopIcon from "@mui/icons-material/Loop";
import LoadingButton from "../../UI/LoadingButton";
import { RadioButtonUncheckedSharp } from "@mui/icons-material";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Map, { Marker } from "react-map-gl";
import pin from "../../Assets/pin.png";
import person from "../../Assets/person.png";

const Home = () => {
  const navigate = useNavigate();
  const sidebarProp = {
    home: true,
    historyReciever: false,
    rewards: false,
    donor: false,
    recieverPage: true,
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
  // modal
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    border: "none",
    borderRadius: "10px",
    p: 4,
  };
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const location = useLocation();
  const [value, setValue] = useState("1");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [donorData, setDonorData] = useState([]);
  const [donorBloodGroupData, setDonorBloodGroupData] = useState([]);
  const [lastDonated, setLastDonated] = useState([]);
  const [donorRequestData, setDonorRequestData] = useState({
    blood_group: "",
    last_donated: "",
  });
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const url = `http://3.109.122.11:8000`;
  const token = localStorage.getItem("access");
  const user_id = localStorage.getItem("user_id");
  const [donorLocations, setDonorLocations] = useState([]);
  const [inputErrorDate, setinputErrorDate] = useState(false);
  const access = async () => {
    if (token !== null) {
      console.log(`Access Token ${token}`);
      try {
        await axios.post(
          `${url}/accounts/token/verify/`,
          {
            token: token,
          },
          {
            headers: {
              "Content-type": "application/json",
            },
          }
        );
      } catch (error) {
        if (error.response.status === 401) {
          toast.error("Please login again!");
          navigate("/login");
        }
      }
    } else {
      toast.error("Please login first!");
      navigate("/login");
    }
  };

  const fetchNearbyDonorData = async (user_id) => {
    try {
      const { data } = await axios.get(`${url}/donor/nearby/${user_id}`, {
        headers: { "Content-Type": "application/json" },
      });
      setData(data);
      console.log("Data", data);
      for (let i = 0; i < data.length; i++) {
        setDonorLocations((prev) => [
          ...prev,
          [data[i].latitude, data[i].longitude],
        ]);
        console.log([data[i].latitude, data[i].longitude]);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const fetchDonorData = async (user_id) => {
    try {
      const { data } = await axios.get(`${url}/accounts/profile/${user_id}`, {
        headers: { "Content-Type": "application/json" },
      });
      setDonorData(data);
      console.log("Data", data);
      setLongitude(Number(data.coordinates.longitude));
      setLatitude(Number(data.coordinates.latitude));
      console.log(longitude, latitude);
    } catch (error) {
      console.log(error);
    }
  };
  const donorOptions = () => {
    const btn = document.getElementById("donorStatusButton");
    const text = btn.innerText;
    if (text === "Be a donor") {
      handleOpen();
    } else if (text === "Go to Donor Dashboard") {
      navigate("/donor-dashboard");
    } else if (text === "Applied for Donor") {
      console.log("applied");
    } else {
      console.log("Not an Option");
    }
  };
  useEffect(() => {
    if (user_id === null) {
      navigate("/login", { replace: true });
      toast.error("Please login first!");
      return;
    }
    fetchNearbyDonorData(user_id);
    fetchDonorData(user_id);
    access();
  }, []);
  const handleSubmit = (event) => {
    event.preventDefault();
  };
  const handleBloodGroupChange = (event) => {
    setDonorBloodGroupData(event.target.value);
    setDonorRequestData({
      ...donorRequestData,
      blood_group: event.target.value,
    });
    console.log(donorRequestData);
  };
  const handleRequiredOnChange = (event) => {
    setLastDonated(event.target.value);
    const current = new Date();
    const date = new Date(event.target.value);
    if (current.getFullYear() === date.getFullYear()) {
      if (date.getMonth() > current.getMonth()) {
        setinputErrorDate(true);
      } else if (
        date.getMonth() === current.getMonth() &&
        date.getDate() > current.getDate()
      ) {
        setinputErrorDate(true);
      } else {
        setinputErrorDate(false);
      }
    }
    setDonorRequestData({
      ...donorRequestData,
      last_donated: event.target.value,
    });
  };
  const handleDonorRequest = async () => {
    try {
      if (donorRequestData.blood_group === "") {
        toast.warn("Blood Group field cannot be empty ");
      } else {
        const { data } = await axios.post(
          `${url}/donor/apply/`,
          { user_id: user_id, blood_group: donorRequestData.blood_group },
          {
            headers: { " Content-Type": "application/json" },
          }
        );
        setDonorData(data);
        console.log("Data", data);
        toast.success("Request submitted successfully");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const goto__request = () => {
    navigate("/request");
  };
  return (
    <div className="homeContainer">
      <div className="homeLeft">
        <div className="sidebarComponent">
          <Sidebar {...sidebarProp} />
        </div>
      </div>
      <div className="homeRight">
        <div className="headerComponent">
          {/* */}
          <Header />
        </div>
        <div className="donor">
          <div className="map-area">
            <h3 className="map-area-heading">Nearby Donors & Bloodbanks</h3>
            <Map
              mapboxAccessToken="pk.eyJ1Ijoic2F5YWsxMCIsImEiOiJjbGp2amwwZWIwMXdsM2Vsb2FvMjViYzUwIn0.OlDv7VNB3W_UlYCuh6PpQA"
              initialViewState={{
                longitude: 88.469444,
                latitude: 22.576847,
                zoom: 14,
              }}
              style={{ width: 600, height: 400 }}
              mapStyle="mapbox://styles/mapbox/streets-v9"
            >
              {donorLocations.map((location) => (
                <Marker
                  longitude={location[1]}
                  latitude={location[0]}
                  anchor="bottom"
                >
                  <img src={person} alt="pin" />
                </Marker>
              ))}
            </Map>
          </div>

          <div className="donorList">
            <div className="submitRequest">
              <LoadingButton
                text={"Submit Request"}
                loading={loading}
                onClick={goto__request}
              />
              <button id="donorStatusButton" onClick={donorOptions}>
                {donorData.donor_application_status === "NA"
                  ? "Be a donor"
                  : donorData.donor_application_status === "AP"
                  ? "Applied for Donor"
                  : "Go to Donor Dashboard"}
              </button>
              <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
              >
                <Box sx={style}>
                  <form
                    onSubmit={(e) => {
                      handleSubmit(e);
                    }}
                  >
                    <div className="form-group">
                      <label htmlFor="bloodGroup">Blood Group *</label>
                      <select
                        id="bloodGroup"
                        value={donorBloodGroupData}
                        onChange={handleBloodGroupChange}
                      >
                        <option value="">Select a blood group</option>
                        <option value="A+">A+</option>
                        <option value="B+">B+</option>
                        <option value="O+">O+</option>
                        <option value="AB+">AB+</option>
                        <option value="A-">A-</option>
                        <option value="B-">B-</option>
                        <option value="O-">O-</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="requiredOn">Last donated on</label>
                      <input
                        id="requiredOn"
                        type="date"
                        value={lastDonated}
                        onChange={handleRequiredOnChange}
                        className="activecls"
                      />
                      {inputErrorDate && (
                        <p className="errorProfileMsg">
                          Future dates cannot be entered
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleDonorRequest}
                      className="requestDonorButton"
                    >
                      Submit
                    </button>
                  </form>
                </Box>
              </Modal>
            </div>
            {/* MUI Multi Tab code */}
            <Box
              sx={{
                width: "95%",
                typography: "body1",
              }}
              className="tabBox"
            >
              <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <TabList
                    onChange={handleChange}
                    aria-label="lab API tabs example"
                  >
                    <Tab label="Nearby Donors" value="1" />
                    <Tab label="Blood-Banks" value="2" />
                    <button className="refreshButton">
                      <LoopIcon className="loop" fontSize="large" />
                    </button>
                  </TabList>
                </Box>

                <TabPanel value="1">
                  {data && data.length !== 0 ? (
                    data.map((data) => (
                      <div className="donorContainer" key={data.donor_id}>
                        <div className="detailbox">
                          <div className="donorDetails">
                            <div className="donorName">
                              <h2>{data.name}</h2>
                            </div>
                            <div className="donorAddress">
                              <h4>Blood Group - {data.blood_group}</h4>
                              <h4>
                                {data.donation_count} donations made till now
                              </h4>
                            </div>
                          </div>
                          <div className="donorDistance">
                            <LocationOnIcon />
                            <p>{data.distance} Kms away</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>
                      Sorry! No nearby donors found. Please try again later!
                    </p>
                  )}
                </TabPanel>
                <TabPanel value="2">No nearby Blood Banks found</TabPanel>
              </TabContext>
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
