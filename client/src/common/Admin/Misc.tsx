import { Button, Card, Divider, Toggle, Fieldset, Image, Input, Select, Spacer, Spinner, Text, useToasts } from "@geist-ui/react";
import { Upload } from '@geist-ui/react-icons';
import axios from "axios";
import React, { useEffect, useState } from 'react';
import { BASE_URL } from "../../constants";
import { Submission } from '../Project/Misc';
import 'react-datepicker/dist/react-datepicker.css'
import DatePicker from "react-datepicker";

interface Accolade {
  _id: string,
  challengeId: string,
  description: string,
  emoji: string,
  eventId: string,
  name: string
}

export interface Challenge {
  _id: string,
  accoladeIds: Array<string>
  name: string,
  question1: string,
  question2: string,
  question3: string,
  question4: string,
  question5: string,
  places: number
}

export interface ChallengesResponse {
  result: Challenge[]
}

interface ChallengeResp {
  result: Challenge
}

interface AccoladeResp {
  result: Accolade
}

export interface Event {
  name: string;
  _id: string;
  show: boolean;
  description: string;
  start_time: string;
  end_time: string;
  challengeIds: string[];
  accoladeIds: string[];
  submissionIds: string[];
  image: string;
  imageKey: string;
  accolades: Accolade[];
  challenges: Challenge[];
  submissions: Submission[];
}

export interface EventResponse {
  result: Event;
}

export interface EventsResponse {
  result: Event[];
}

/**
 * Entire admin page
 */
 export const AdminPage: React.FC = () => {
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [eventList, setEventList] = useState<Event[]>([]);
  useEffect(() => {
    let mounted = true
    axios.get<EventsResponse>(`${BASE_URL}/api/events`)
    .then(res => {
      if (mounted){
        setEventList(res.data.result)
       setEventsLoaded(true)
      }
    });
    return () => {
      mounted = false;
    }
  },[]);

  const sendNotification = (msg:string, intent: any) => {
    setToast({ text: msg, type: intent, delay: 8000 });
  };

  const [curEventId, setCurEventId] = useState<string>("");
  const [eventLoaded, setEventLoaded] = useState(false);
  const [, setToast] = useToasts();

  const [curEvent, setCurEvent] = useState<Event>();
  useEffect(() => {
    let mounted = true
    if (curEventId && curEventId !== "create_new_event") {
      setEventLoaded(false);
      axios.get<EventResponse>(`${BASE_URL}/api/${curEventId}?full=true`)
      .then(res => {
        if (mounted) {
          setCurEvent(res.data.result);
          setEventLoaded(true);
        }
      });
      return () => {
        mounted = false;
      }
    }
  },[curEventId]);

  const setEventHandler = (val:any) => {
    if (val === "create_new_event") {
      const date_string = new Date().toISOString();
      axios.post(`${BASE_URL}/api/admin/add/event`, {
        name: `New Event created at ${date_string}`,
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit....",
        start_time: date_string,
        end_time: date_string
      })
      .then(res => {
        sendNotification("Added new event!", "success");
      })
      .catch(res => {
        sendNotification(String(res.response.data.error), "error");
      })
    }
    setCurEventId((val as string));
  };
  
  const [editable, setEditable] = useState(false);
  const handleEditButton = () => {

    setEditable(prev => {
      if (prev) {
        axios.post(`${BASE_URL}/api/admin/add/event`, curEvent)
        .then(() => sendNotification("Updated event!", "success"))
        .catch(res => {
          sendNotification(String(res.response.data.error), "error");
        })
      }
      return !prev
    });
  }

  const deleteEvent = () => {
    if (window.confirm(`Are you sure you want to delete ${curEvent?.name}`)) {
      if (window.prompt("To delete this event, enter the full event name","") === curEvent?.name) {
        axios.post(`${BASE_URL}/api/${curEventId}/admin/remove/event`)
        .then(() => sendNotification("Deleted event!", "success"))
        .catch(res => {
          sendNotification(String(res.response.data.error), "error");
        })
      } else {
        window.alert("Incorrect event name.")
      }
    }
  }

  const eventDataHandler = (e:any) => setCurEvent((prev:any) => ({...prev, [e.target.id]: e.target.value}));
  const eventDateDataHandler = (e:any, place:string) => setCurEvent((prev:any) => ({...prev, [place]: e}));

  const [curAccolade, setCurAccolade] = useState<Accolade>();
  const handleEditAccolade = (id:string) => {
    axios.get<AccoladeResp>(`${BASE_URL}/api/${curEventId}/accolade/${id}`)
    .then(res => setCurAccolade(res.data.result));
  }
  const emptyCurAccolade = () => setCurAccolade({
    _id: "",
    challengeId: "",
    description: "",
    emoji: "",
    eventId: "",
    name: ""})
  const accoladeDataHandler = (e:any) => setCurAccolade((prev:any) => ({...prev, [e.target.id]: e.target.value}));
  const handleUpdateAccolade = () => {
    axios.post(`${BASE_URL}/api/${curEventId}/admin/add/accolade`, curAccolade)
    .then(() => {
      sendNotification("Updated accolade!", "success")
      emptyCurAccolade();
    })
    .catch(res => {
      sendNotification(String(res.response.data.error), "error");
    })
  }
  const deleteAccolade = () => {
    axios.post(`${BASE_URL}/api/${curEventId}/admin/remove/accolade/${curAccolade?._id}`)
    .then(() => {
      sendNotification("Deleted accolade!", "success")
      emptyCurAccolade();
    })
    .catch(res => {
      sendNotification(String(res.response.data.error), "error");
    })
  }

   const [curChallenge, setCurChallenge]=useState<Challenge>();
   const challengeDataHandler = (e:any) => setCurChallenge((prev:any) => ({...prev,  [e.target.id]: e.target.value}));
   const emptyCurChallenge = () => setCurChallenge({
    _id: "",
    name: "",
    places: 0,
    accoladeIds: [],
    question1: "",
    question2: "",
    question3: "",
    question4: "",
    question5: "",
   })
   const handleUpdateChallenge = () => {
     axios.post(`${BASE_URL}/api/${curEventId}/admin/add/challenge`, curChallenge)
     .then(() => {
       sendNotification("Updated challenge!", "success")
       emptyCurChallenge();
     })
     .catch(res => {
       sendNotification(String(res.response.data.error), "error");
     })
   }
   const deleteChallenge = () => {
    axios.post(`${BASE_URL}/api/${curEventId}/admin/remove/challenge/${curChallenge?._id}`)
    .then(() => {
      sendNotification("Deleted challenge!", "success")
      emptyCurChallenge();
    })
    .catch(res => {
      sendNotification(String(res.response.data.error), "error");
    })
   }
   const handleEditChallenge = (id:string) => {
    axios.get<ChallengeResp>(`${BASE_URL}/api/${curEventId}/challenge/${id}`)
    .then(res => setCurChallenge(res.data.result));
   }

   const [file, setFile] = useState<any>();
   const fileHandler = (e:any) => {
     setFile(e.target.files[0])
   }
   const uploadFile = () => {
     const data = new FormData();
     data.append('file', file);
     axios.post(`${BASE_URL}/api/${curEventId}/admin/upload/eventImage`, data)
     .then(res => {
      sendNotification("Uploaded image!", "success")
    })
    .catch(res => {
      sendNotification(String(res.response.data.error), "error");
    })
   }

  if (!eventsLoaded) {
    return (<Spinner />)
  } else {
    return (
      <>
      <Spacer h={0.5}/>
      <Select placeholder="Add/Select an Event" onChange={setEventHandler}>
        <Select.Option value="create_new_event">Add new event</Select.Option>
        <Select.Option divider />
        {eventList.map(event => {
          return <Select.Option key={event._id} value={event._id}>{event.name}</Select.Option>
        })}
      </Select>
      {eventLoaded &&
      <>
      <Spacer h={1}/>
      <Input width="100%" label="id" disabled value={curEvent?._id} id="_id"/>
      <Spacer h={1}/>
      <Input width="100%" label="Name" disabled={!editable} value={curEvent?.name} id="name" onChange={eventDataHandler}/>
      <Spacer h={1}/>
      <Input width="100%" label="Description" disabled={!editable} value={curEvent?.description} id="description" onChange={eventDataHandler}/>
      <Spacer h={1}/>
      <Text>Visible to public:</Text>
      <Toggle checked={curEvent?.show} disabled={!editable} onChange={(e:any) => {
        e.target.value = e.target.checked
        e.target.id = "show"
        eventDataHandler(e);
        }}/>
      <Spacer h={1}/>
      <Text>Start time:</Text>
      <DatePicker
        selected={new Date(Date.parse(curEvent!.start_time))}
        onChange={(date) => eventDateDataHandler(date?.toString(), "start_time")}
        timeInputLabel="Time:"
        dateFormat="MM/dd/yyyy h:mm aa"
        showTimeInput
        readOnly={!editable}
      />
      <Spacer h={1}/>
      <Text>End time:</Text>
      <DatePicker
        selected={new Date(Date.parse(curEvent!.end_time))}
        onChange={(date) => eventDateDataHandler(date?.toString(), "end_time")}
        timeInputLabel="Time:"
        dateFormat="MM/dd/yyyy h:mm aa"
        showTimeInput
        readOnly={!editable}
      />
      <Spacer h={1}/>
      <Button onClick={handleEditButton}>{editable ? "Update" : "Edit"}</Button>
      <Spacer h={0.5}/>
      <Button onClick={deleteEvent}>Delete</Button>
      <Spacer h={1}/>
      <Image height="160px" src={curEvent ? curEvent.image : ""} />
      <Spacer h={1}/>
      <Input htmlType="file" name="file" onChange={fileHandler} iconClickable iconRight={<Upload />} onIconClick={uploadFile}/>
      <Spacer h={1}/>
      <Fieldset.Group value="accolades">
        <Fieldset label="accolades">
          <Card>
            <Card.Content>
              <Text b>Add/Update an Accolade</Text>
            </Card.Content>
            <Divider />
            <Card.Content>
              <Input label="Name" value={curAccolade?.name} id="name" onChange={accoladeDataHandler}/>
              <Spacer h={0.5}/>
              <Input label="Description" value={curAccolade?.description} id="description" onChange={accoladeDataHandler}/>
              <Spacer h={0.5}/>
              <Input label="Emoji" value={curAccolade?.emoji} id="emoji" onChange={accoladeDataHandler}/>
              <Spacer h={0.5}/>
              <Select value={curAccolade?.challengeId} placeholder="Select a Challenge" onChange={(s:any) => setCurAccolade((prev:any) => ({...prev, challengeId: s}))}>
                {curEvent?.challenges.map(challenge => {
                  return <Select.Option key={challenge._id} value={challenge._id}>{challenge.name}</Select.Option>
                })}
              </Select>
              <Spacer h={0.5}/>
              <Button onClick={handleUpdateAccolade}>{curAccolade?._id ? "Update" : "Add"}</Button>
              <Spacer h={0.5}/>
              <Button onClick={deleteAccolade}>Delete</Button>
            </Card.Content>
          </Card>
          <Spacer h={0.5}/>
          {curEvent?.accolades.map(accolade => (
            <Card key={accolade._id}>
              <Text>{accolade.name}</Text>
              <Text>{accolade.description}</Text>
              <Button auto scale={0.5} value={accolade._id} onClick={() => handleEditAccolade(accolade._id)}>Edit</Button>
            </Card>
            )
          )}
        </Fieldset>
        <Fieldset label="challenges">
        <Card>
            <Card.Content>
              <Text b>Add/Update a Challenge</Text>
            </Card.Content>
            <Divider />
            <Card.Content>
              <Input label="Name" value={curChallenge?.name} id="name" onChange={challengeDataHandler}/>
              <Spacer h={0.5}/>
              <Button onClick={handleUpdateChallenge}>{curChallenge?._id ? "Update" : "Add"}</Button>
              <Spacer h={0.5}/>
              <Button onClick={deleteChallenge}>Delete</Button>
            </Card.Content>
          </Card>
          <Spacer h={0.5}/>
          {curEvent && curEvent.challenges.map(challenge => (
            <Card key={challenge._id}>
              <Text>{challenge.name}</Text>
              <Text>{challenge.question1}</Text>)
              <Button auto scale={0.5} value={challenge._id} onClick={() => handleEditChallenge(challenge._id)}>Edit</Button>
            </Card>
            )
          )}
        </Fieldset>
        <Fieldset label="submissions">
        {curEvent && curEvent.submissions.map(submission => 
        (<Card key={submission._id}>
            <Text>{submission.name}</Text>
          </Card>)
        )}
        </Fieldset>
      </Fieldset.Group>
      </>
      }
    </>)
  }
};
