import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import TimezoneSelect from 'react-timezone-select';
import { saveAs } from 'file-saver';
import 'react-datepicker/dist/react-datepicker.css';

const WeeklyScheduler = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimezone, setSelectedTimezone] = useState({ value: 'UTC+0', label: 'UTC+0' });
  const [weeklySchedule, setWeeklySchedule] = useState([]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleWeekChange = (direction) => {
    const newDate = new Date(selectedDate);
    direction === 'next' ? newDate.setDate(newDate.getDate() + 7) : newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const handleTimezoneChange = (timezone) => {
    setSelectedTimezone(timezone);
  };

  const formatTime = (time) => {
    const [hour, minute] = time.split(":");
    const formattedHour = parseInt(hour, 10) % 12 || 12;
    const period = parseInt(hour, 10) < 12 ? "AM" : "PM";
    return `${formattedHour}:${minute} ${period}`;
  };

  const generateAndSaveJsonFile = () => {
    const jsonData = weeklySchedule.flatMap((daySchedule) =>
      daySchedule.schedule.map((slot) => ({
        Id: `${daySchedule.day}_${slot.time}`,
        Date: selectedDate.toISOString().split('T')[0],
        Time: slot.time,
        Checked: slot.checked,
      }))
    );

    const jsonString = JSON.stringify(jsonData, null, 2);

    const blob = new Blob([jsonString], { type: 'application/json' });
    saveAs(blob, 'weekly_schedule.json');
  };

  useEffect(() => {
    const generateWeeklySchedule = () => {
      const startHour = 8;
      const endHour = 23;
      const intervalMinutes = 30;
      const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

      const schedule = daysOfWeek.map((day) => {
        const daySchedule = [];
        for (let hour = startHour; hour <= endHour; hour++) {
          for (let minute = 0; minute < 60; minute += intervalMinutes) {
            const formattedHour = hour < 10 ? `0${hour}` : `${hour}`;
            const formattedMinute = minute === 0 ? '00' : `${minute}`;
            const time = `${formattedHour}:${formattedMinute}`;
            daySchedule.push({
              time,
              checked: false,
            });
          }
        }
        return {
          day,
          schedule: daySchedule,
        };
      });

      setWeeklySchedule(schedule);
    };

    generateWeeklySchedule();
  }, [selectedDate, selectedTimezone]);

  return (
    <div className='container'>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div onClick={() => handleWeekChange('prev')} style={{ cursor: "pointer", alignSelf: "center" }}>Previous Week</div>
        <DatePicker selected={selectedDate} onChange={handleDateChange} />
        <div onClick={() => handleWeekChange('next')} style={{ cursor: "pointer", alignSelf: "center" }}>Next Week</div>
      </div>
      <div>
        <TimezoneSelect value={selectedTimezone} onChange={handleTimezoneChange} />
      </div>
      <div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Render weekly working days, times, and checkboxes */}
          {weeklySchedule.map((daySchedule) => (
            <div key={daySchedule.day} style={{ marginBottom: "16px", display: "flex", }}>
              <h3>{daySchedule.day}</h3>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {daySchedule.schedule.map((slot) => (
                  <div key={slot.time} style={{ display: "flex", alignItems: "center", marginRight: "16px", marginBottom: "8px" }}>
                    <input
                      type="checkbox"
                      checked={slot.checked}
                      onChange={() => console.log(`Checkbox clicked for ${daySchedule.day} ${slot.time}`)}
                      style={{ backgroundColor: "red" }}
                    />
                    <span style={{ marginLeft: "8px" }}>{`${formatTime(slot.time)} `
                      // - ${slot.checked ? 'Available' : 'Not Available'}
                    }</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <button onClick={generateAndSaveJsonFile}>Generate and Save JSON</button>
        <p>Selected Timezone: {selectedTimezone.label}</p>
        <p>Selected Date: {selectedDate.toDateString()}</p>
      </div>
    </div>
  );
};

export default WeeklyScheduler;


