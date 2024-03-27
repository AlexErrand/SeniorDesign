import "../App.css";
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar.tsx";
import { AuthorizedUser } from "../api/AuthorizedUser.tsx";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { getCurrentFormattedDate } from "../util/dateUtils.ts";
import { apiGet } from "../api/serverApiCalls.tsx";
import UpcomingEvents from "../components/UpcomingEvents.tsx";
import { EventInput } from "@fullcalendar/core";
import UpcomingEventsLoading from "../components/UpcomingEventsLoading.tsx";
import GenerateRecommendations from "../components/GenerateRecommendations.tsx";
import ChatBot from "../components/ChatBot.tsx";
import Divider from "../components/card/Divider.tsx";
import Card from "../components/card/Card.tsx";
import CardRow from "../components/card/CardRow.tsx";
import Column from "../components/card/Column.tsx";
import CardList from "../components/card/CardList.tsx";

interface UserRecord {
  name: string;
  streak: number;
  completedExercises: number;
}

const Home: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [statuses, setStatuses] = useState<string[]>([]);
  const [todaysEvent, setTodaysEvents] = useState<EventInput[]>([])
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserRecord | null>(null);

  useEffect(() => {
    AuthorizedUser(navigate);
    apiGet("/user")
      .then(data => {
        if (data.authorized) {
          setName(data.user.first_name);
          setTodaysEvents(data.user.calendar);
        }
      })
      .catch(error => {
        console.log(error);
        navigate('/login');
      })
      .finally(() => setLoading(false));

    apiGet("/get_user_records")
      .then(response => {
        if (response.authorized && response.user) {
          setUserData({
            name: response.user.name,
            streak: response.user.streak,
            completedExercises: response.user.completedExercises
          });
        } else {
          console.log("No user data returned or not authorized.");
        }
      })
      .catch(error => {
        console.log(error);
      });
  }, [navigate]);

  const UserStatsDisplay = () => {
    return (
      <Card>
        <CardRow>
          <div className="card-inside-header-text">Your Statisitcs</div>
          <div className="card-button">
            <Button variant="text" color="primary" onClick={() => navigate("/leaderboard")}>View Leaderboard</Button>
          </div>
        </CardRow>
        <Divider />
        {!userData && <CardList>
          <p className="card-text">Loading...</p>
        </CardList>}
        {userData && <CardList>
          <p className="card-text">Your current streak: {userData.streak}</p>
          <p className="card-text">Your completed exercises: {userData.completedExercises}</p>
        </CardList>}
      </Card>
    );
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const updates = new FormData(event.currentTarget);
    const status = updates.get("updates");
    if (status) {
      const newStatuses = [status.toString(), ...statuses];
      const updatedStatuses = newStatuses.slice(0, 3); // can limit how many statuses show at once.
      setStatuses(updatedStatuses);
    }
  };

  return (
    <React.Fragment>
      <Navbar />
      <Card>
        <CardRow>
          <p className="card-header-text">Welcome, {name}!</p>
          <p className="card-right-text">{getCurrentFormattedDate()}</p>
        </CardRow>
      </Card>
      <Column>
        <UserStatsDisplay />
        <Card>
          <form onSubmit={handleFormSubmit} className="card-item">
            <TextField
              type="text"
              id="updates"
              name="updates"
              fullWidth
              label="What's on your mind?"
              inputProps={{ min: "0", step: "1" }}
              sx={{ marginRight: '16px' }}
            />
            <Button type="submit" variant="contained" color="primary">Post</Button>
          </form>
          <div className="card-info">
            {statuses.map((status, index) => (
              <div key={index} className="posted-status">
                {status}
              </div>
            ))}
          </div>
        </Card>
        <div>
          <GenerateRecommendations />
          {loading ? (<UpcomingEventsLoading />) : (<UpcomingEvents events={todaysEvent} />)}
        </div>
      </Column>
      <ChatBot />
    </React.Fragment>
  );
};

export default Home;