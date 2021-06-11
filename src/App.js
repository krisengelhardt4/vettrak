import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import { getTraversalObj, parse } from 'fast-xml-parser';
import ScheduleTest from './ScheduleTest';
import { CircularProgress } from '@material-ui/core';
import moment from 'moment';

function App() {

    const [token, setToken] = useState();
    const [intensiveCourses, setIntensiveCourses] = useState([]);
    const [timetableData, setTimetableData] = useState([{}]);
    const [timetableReady, setTimetableReady] = useState(false);
    const [courseID, setCourseID] = useState([16046, 16305, 16392, 16142, 16507, 16193, 16192, 16475, 16476, 16082, 16642, 16253, 16505, 16393, 16328, 16141, 16521, 16394, 15929, 15930]);


    let AuthenticateLogin = `<?xml version="1.0" encoding="utf-8"?>\
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
        <soap:Body>\
            <ValidateClient xmlns="http://www.ozsoft.com.au/VETtrak/api/complete">\
            <sUsername>Kris</sUsername>\
            <sPassword>Kngdh787fg8x</sPassword>\
            </ValidateClient>\
        </soap:Body>\
    </soap:Envelope>`





    function APILoginRequest(){
        axios.post('https://cors-anywhere.herokuapp.com/https://sthservices.ozsoft.com.au/SIU_API/VT_API.asmx?wsdl',
        AuthenticateLogin,
        { 
            headers:{ 
                      'Content-Type': 'text/xml',
                      
                      }
        }).then(res=>{
          var jsonObj = parse(res.data );
          setToken(jsonObj.["soap:Envelope"]["soap:Body"].ValidateClientResponse.ValidateClientResult.Token)

        }).catch(err=>{console.log(err);
        }).finally(() => {

        });  
    }

    const getAPIToken = async () => {
      const result = await axios.post('https://cors-anywhere.herokuapp.com/https://sthservices.ozsoft.com.au/SIU_API/VT_API.asmx?wsdl',
      AuthenticateLogin,
      { 
          headers:{ 
                    'Content-Type': 'text/xml',
                    
                    }
      }).then(result => {
        var jsonObj = parse(result.data);
        
        setToken(jsonObj.["soap:Envelope"]["soap:Body"].ValidateClientResponse.ValidateClientResult.Token);
      })
    }

    function prepareData() {
          var i = 0;
          while (i < courseID.length - 1) {
            var  xmlRequest = `<?xml version="1.0" encoding="utf-8"?>
            <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
              <soap:Body>
                <GetOccurrenceExtendedDetails xmlns="http://www.ozsoft.com.au/VETtrak/api/complete">
                  <token>${token}</token>
                  <occurrenceId>${courseID[i]}</occurrenceId>
                </GetOccurrenceExtendedDetails>
              </soap:Body>
            </soap:Envelope>`
            GetTimetableData(xmlRequest)
            setCourseID(courseID + 1)
            i = i + 1;
          }
    }

    async function GetTimetableData(xmlsChosen){
      await axios.post('https://cors-anywhere.herokuapp.com/https://sthservices.ozsoft.com.au/SIU_API/VT_API.asmx?wsdl',
      xmlsChosen,
      { 
          headers:{ 
                    'Content-Type': 'text/xml',
                  }
      }).then(res=>{
        var jsonObj = parse(res.data);
        setIntensiveCourses(intensiveCourses => [...intensiveCourses, jsonObj.["soap:Envelope"]["soap:Body"].GetOccurrenceExtendedDetailsResponse.GetOccurrenceExtendedDetailsResult.OccuExtended] );     
      }).catch(err=>{console.log(err);
      }).finally(() => {
        
      });  
  }   



    useEffect(() => {
      getAPIToken();
    }, [] )

    useEffect(() => {
      if (token == undefined) {
      } else {
        prepareData();
      }
    }, [token])

    useEffect(() => {
      if (intensiveCourses.length >= 19) {
        sendDataToTimetable();
      }
    }, [intensiveCourses])

    

    function sendDataToTimetable() {
      var i = 0;
      while (i <= intensiveCourses.length - 1) {
        intensiveCourses[i].Classes.TInst.map((course) => {

          var priorityId = course.Room_Code
          var instCode = 0;
          var courseCode;
          var programTitle;
          var startTime = moment(course.Inst_Start).format('hh:mm');
          var endTime = moment(course.Inst_Finish).format('hh:mm');
          var shortCode = intensiveCourses[i].OccurrenceDetail.Code.substring(0, 4);
          var className = "Placeholder";
          

          if (priorityId === "Nest") {
            priorityId = 3;
          } else if (priorityId === "CROW") {
            priorityId = 4;       
          } else if (priorityId === "ZOOM") {
            priorityId = 5;
          } else if (priorityId === "Cafe") {
            priorityId = 5;
          }

          if (course.Prog_Name.includes("Blended")) {
            courseCode = 1;
            programTitle = "Blended";
            if (course.Inst_Code.includes("Reflection")) {
              instCode = "Reflection";
            } else {
              instCode = course.Inst_Code.substring(1, 2);
            }
          } else if ( course.Prog_Name.includes("Intensive")) {
            courseCode = 2;
            className = course.Inst_Code.substring(7, 12);
            programTitle = "Intensive";
            if (course.Inst_Code.includes("Reflection")) {
              instCode = "Reflection";
            } else {
              instCode = course.Inst_Code.substring(3, 5);
            }
            
          } else if (course.Prog_Name.includes("Open")){
            instCode = course.Inst_Code
            courseCode = 3;
          } else {
            courseCode = 4;
            instCode = course.Inst_Code
          }
          
          
          
          
          
          
          setTimetableData(timetableData => [...timetableData, {
            title: course.Prog_Name, 
            priorityId: priorityId, 
            startDate: course.Inst_Start, 
            endDate: course.Inst_Finish, 
            id: 1, 
            courseCode: courseCode, 
            shortCode: shortCode, 
            instCode: instCode, 
            courseTitle: programTitle, 
            startTime: startTime, 
            endTime: endTime,
            className: className,
          }, 
          ])
        })
        
        i = i + 1;
        
      }
      setTimetableReady(true);
    };


    return(
      <div className="App">
        {!timetableReady && 
          <div>       
              <h1>Serve It Up Timetable Test</h1>
              <h1>Please wait while the timetable loads</h1>
          </div>
        }
        {!timetableReady && <CircularProgress />}
        {timetableReady && <ScheduleTest timetableData={timetableData} />}   
    </div>
    ) 

}

export default App;
