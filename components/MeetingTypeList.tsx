'use client'
import React, { useState } from 'react'
import HomeCard from './HomeCard'
import { useRouter } from 'next/navigation'
import MeetingModal from './MeetingModal'
import { useUser } from '@clerk/nextjs'
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk'
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from './ui/textarea'
import ReactDatePicker from "react-datepicker"
import { Input } from './ui/input'


const MeetingTypeList = () => {
  const router = useRouter();
  const [meetingState, setmeetingState] = useState<'isScheduleMeeting' |
  'isJoiningMeeting' | 'isInstantMeeting'| undefined>()
  const {user} = useUser();
  const client = useStreamVideoClient();
  const [values, setvalues] = useState({
    dateTime :  new Date(),
    description:'',
    link:''
  })
  const [callDetails, setcallDetails] = useState<Call>()
  const { toast } = useToast()

  const createMeeting = async() =>{
    if(!client || !user) return;
    try{
      if(!values.dateTime){
        toast({
          title: "Please select date and time"
        })
        return;
      }
      const id = crypto.randomUUID();
      const call = client.call('default',id)
      if(!call) throw new Error ('Failed to create call')
      
      const startsAt = values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || 'Instant meeting'

      await call.getOrCreate({
        data:{
          starts_at:startsAt,
          custom:{
            description
          }
        }
      })
      setcallDetails(call)
      if(!values.description){
        router.push(`/meeting/${call.id}`)
      }
      toast({
        title: "Meeting created"
      })
    }catch (error){
      console.log(error)
      toast({
        title: "Failed to create meeting"
      })
    }
  }
  const meetingLink=`${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetails?.id}`

  return (
    <section className='grid grid-cols-1 gap-5 md:grid-cols-2
    lg:grid-cols-4'>
      <HomeCard
      img="/icons/add-meeting.svg"
      title="New Meeting"
      description="start an instant meeting"
      handleClick={()=> setmeetingState('isInstantMeeting')}
      className="bg-orange-1"
      />
      <HomeCard
      img="/icons/join-meeting.svg"
      title="Join Meeting"
      description="via invitation link"
      handleClick={()=>setmeetingState('isJoiningMeeting')}
      className="bg-blue-1"
      />
      <HomeCard
      img="/icons/schedule.svg"
      title="Schedule Meeting"
      description="Plan your meeting"
      handleClick={()=>setmeetingState('isScheduleMeeting')}
      className="bg-purple-1"
      />
      <HomeCard
      img="/icons/recordings.svg"
      title="View Recordings"
      handleClick={()=>router.push('/recordings')}
      description="Meeting recordings"
      className="bg-yellow-1"
      />
      {!callDetails?(
        <MeetingModal 
        isOpen = {meetingState === 'isScheduleMeeting'}
        onClose = {()=>setmeetingState(undefined)}
        title = "Create Meeting "
        className= "text-center"
        handleClick={createMeeting}>
          <div className='flex flex-col gap-2.5'>
            <label className='text-base font-normal leading-[22px] text-sky-2'>
              add a description
            </label>
            <Textarea
              className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0"
              onChange={(e) =>
                setvalues({ ...values, description: e.target.value })
              }
            />
          </div>
          <div className='flex flex-col gap-2.5 w-full'>
          <label className='text-base font-normal leading-[22px] text-sky-2'>
              Select Date and Time
            </label>
            <ReactDatePicker
            selected={values.dateTime}
            onChange={(date)=>setvalues({...values,dateTime:date!})}
            showTimeSelect
            timeFormat='HH:mm'
            timeIntervals={15}
            timeCaption='time'
            dateFormat="MMMM d,yyy h:mm aa"
            className='w-full rounded bg-dark-3 p-2 focus:outline-none'
            />
          </div>
        </MeetingModal>
      ):(
        <MeetingModal 
        isOpen = {meetingState === 'isScheduleMeeting'}
        onClose = {()=>setmeetingState(undefined)}
        title = "Start an instant meeting"
        className= "text-center"
        handleClick={()=>{
          navigator.clipboard.writeText(meetingLink)
          toast({title:'link copied'})
        }}
        image ="/icons/checked.svg"
        buttonIcon='/icons/copy.svg'
        buttonName="copy meeting Link"
      />
      )}

      <MeetingModal 
        isOpen = {meetingState === 'isInstantMeeting'}
        onClose = {()=>setmeetingState(undefined)}
        title = "Start an instant meeting"
        className= "text-center"
        buttonName="start Meeting"
        handleClick={createMeeting}
      />
      <MeetingModal 
        isOpen = {meetingState === 'isJoiningMeeting'}
        onClose = {()=>setmeetingState(undefined)}
        title = "Type the link here"
        className= "text-center"
        buttonName="Join Meeting"
        handleClick={()=>router.push(values.link)}
      >
        <Input placeholder='Meeting link' className='border-none bg-dark-3
        focus-visible:ring-0 focus-visible:ring-offset-0' onChange={(e)=>setvalues({...values,link:e.target.value})}/>
      </MeetingModal>
    </section>
  )
}

export default MeetingTypeList