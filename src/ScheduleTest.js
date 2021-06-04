import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import MoreIcon from '@material-ui/icons/MoreVert';
import Grid from '@material-ui/core/Grid';
import './Scheduler.css';
import classNames from 'clsx';
import {
  ViewState, EditingState, GroupingState, IntegratedGrouping, IntegratedEditing,
} from '@devexpress/dx-react-scheduler';
import {
  Scheduler,
  Resources,
  Appointments,
  AppointmentForm,
  AppointmentTooltip,
  GroupingPanel,
  WeekView,
  MonthView,
  Toolbar,
  ViewSwitcher,
} from '@devexpress/dx-react-scheduler-material-ui';
//import { data as appointments } from './Data';

const isWeekOrMonthView = viewName => viewName === 'Week' || viewName === 'Month';

const style = ({ palette }) => ({
  icon: {
    color: palette.action.active,
  },
  textCenter: {
    textAlign: 'center',
  },
  firstRoom: {
    background: 'url(https://js.devexpress.com/Demos/DXHotels/Content/Pictures/Lobby-4.jpg)',
  },
  secondRoom: {
    background: 'url(https://js.devexpress.com/Demos/DXHotels/Content/Pictures/MeetingRoom-4.jpg)',
  },
  thirdRoom: {
    background: 'url(https://js.devexpress.com/Demos/DXHotels/Content/Pictures/MeetingRoom-0.jpg)',
  },
  header: {
    height: '260px',
    backgroundSize: 'cover',
  },
  commandButton: {
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
});

const priorityData = [
  { text: 'Classroom 1', id: 1 },
  { text: 'Classroom 2', id: 2},
  { text: 'The Nest', id: 3 },
  { text: 'White Crow', id: 4},
  { text: 'Zoom', id: 5},
];

const styles = ({ spacing, palette, typography }) => ({
  formControlLabel: {
    padding: spacing(2),
    paddingLeft: spacing(10),
  },
  text: {
    ...typography.caption,
    color: palette.text.secondary,
    fontWeight: 'bold',
    fontSize: '1rem',
  },
});





export default class Demo extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {appointments: props.timetableData}
   
    this.state = {
      data: this.state.appointments.filter(appointment => appointment.priorityId < 6),
      resources: [{
        fieldName: 'priorityId',
        title: 'Priority',
        instances: priorityData,
        appointments: this.state.appointments,
      }],
      grouping: [{
        resourceName: 'priorityId',
      }],

      groupByDate: isWeekOrMonthView,
      isGroupByDate: true,
    };
    
    this.commitChanges = this.commitChanges.bind(this);
    this.onGroupOrderChange = () => {
      const { isGroupByDate } = this.state;
      this.setState({
        isGroupByDate: !isGroupByDate,
        groupByDate: isGroupByDate ? undefined : isWeekOrMonthView,
      });
    };
  }

 

  commitChanges({ added, changed, deleted }) {
    this.setState((state) => {
      let { data } = state;
      if (added) {
        const startingAddedId = data.length > 0 ? data[data.length - 1].id + 1 : 0;
        data = [...data, { id: startingAddedId, ...added }];
      }
      if (changed) {
        data = data.map(appointment => (
          changed[appointment.id] ? { ...appointment, ...changed[appointment.id] } : appointment));
      }
      if (deleted !== undefined) {
        data = data.filter(appointment => appointment.id !== deleted);
      }
      return { data };
    });

    
  }


  
  render() {
    
    const {
      data, resources, grouping, groupByDate, isGroupByDate,
    } = this.state;

   
    
    const CustomAppointment = ({ style, ...restProps }) => {


      
      var colour = "teal";
        if (restProps.data.instCode === "1") {
          colour = "red";
        }
      
      if (restProps.data.courseCode == "1")
          
      
        return (
          <Appointments.Appointment
            {...restProps}
            
            style={{ ...style, backgroundColor: colour,  minWidth: 100, maxWidth: 100 }}
            className="CLASS_ROOM1"
            data={restProps.data.courseCode}
          />
        );

        if (restProps.data.courseCode == "2")
        return (
          <Appointments.Appointment
            {...restProps}
            style={{ ...style, backgroundColor: "blue", minWidth: 100, maxWidth: 100 }}
            className="CLASS_ROOM1"
            data={restProps.data.courseCode}
          />
        );
        return (
          <Appointments.Appointment
            {...restProps}
            style={{ ...style, backgroundColor: "orange",  minWidth: 100, maxWidth: 100 }}
            className="CLASS_ROOM1"
            data={restProps.data.courseCode}
          />
        );
    };

    const AppointmentContent = ({ style, ...restProps }) => {
      console.log(style);
      return (
        
        <Appointments.AppointmentContent {...restProps}>
          
          <div style={{height: 600, minWidth: 50 }} className={restProps.container}>
            <center>
              <h3>{restProps.data.shortCode}</h3>
              <h4>{restProps.data.className}</h4>
              <div><h4>{restProps.data.courseTitle}</h4></div>
              <div><h4>{restProps.data.startTime} - {restProps.data.endTime}</h4></div>
              <div>Steph M</div>
              <div><h3>{restProps.data.instCode}</h3></div>
            </center>
          </div>
        </Appointments.AppointmentContent>
      );
    };

    const getClassByLocation = (classes, location) => {
      if (location === 'Room 1') return classes.firstRoom;
      if (location === 'Room 2') return classes.secondRoom;
      return classes.thirdRoom;
    };

    const Header = withStyles(style, { name: 'Header' })(({
      children, appointmentData, classes, ...restProps
    }) => (
      
      <AppointmentTooltip.Header
        {...restProps}
        
        className={classNames(getClassByLocation(classes, appointmentData.location), classes.header)}
        appointmentData={appointmentData}
      >
        <IconButton
          /* eslint-disable-next-line no-alert */
          onClick={() => alert(JSON.stringify(appointmentData))}
          className={classes.commandButton}
        >
          <MoreIcon />
        </IconButton>
      </AppointmentTooltip.Header>
    ));

    const CommandButton = withStyles(style, { name: 'CommandButton' })(({
      classes, ...restProps
    }) => (
      <AppointmentTooltip.CommandButton {...restProps} className={classes.commandButton} />
    ));
    
    
    const Content = withStyles(style, { name: 'Content' })(({
      children, appointmentData, classes, ...restProps
    }) => (
      
      <AppointmentTooltip.Content {...restProps} appointmentData={appointmentData}>
        
        <Grid container alignItems="center">
          <Grid item xs={2} className={classes.textCenter}>
          {console.log(children)}
          </Grid>
          <Grid item xs={10}>
            <span></span>
          </Grid>
        </Grid>
      </AppointmentTooltip.Content>
    ));
    

 
    

    return (
        <React.Fragment>
          
          <Paper>
            <Scheduler
              data={data}
              height={820}
              width={800}
            >
              <ViewState
                defaultCurrentDate="2021-04-19"
              />

              <GroupingState
                grouping={grouping}
                groupByDate={groupByDate}
              />

              <WeekView
                startDayHour={8}
                endDayHour={20}
                excludedDays={[0, 6]}
                cellDuration={60}
              />
              <MonthView />

              <Appointments 
                appointmentComponent={CustomAppointment}
                appointmentContentComponent={AppointmentContent}
              />
              <AppointmentTooltip 
                headerComponent={Header}
                contentComponent={Content}
                commandButtonComponent={CommandButton}
                showCloseButton
              />

              <Resources
                data={resources}
                mainResourceName="priorityId"
              />
              <IntegratedGrouping />

              
              <AppointmentForm />
              <Toolbar />
              <ViewSwitcher />
              <GroupingPanel />
            </Scheduler>
          </Paper>
        </React.Fragment>
    );
  }
}
