"use client"

import ReservationCart from "../../../../components/ReservationCart";
import { use, useState } from "react";
import { useEffect } from "react";
import  getBooking  from "../../../../libs/getBooking";
import { BookingsItem } from "../../../../../interfaces";
import  Image from "next/image";
import Link from "next/link";
import { useSession } from 'next-auth/react'
import dayjs, { Dayjs } from "dayjs";
import { Button } from "@mui/material";
import { useRouter } from "next/router";
import LocationDateReserve from "../../../../components/LocationDateReserve";

export default function DetailPage(bid:string) {

    const [bookingItems, setBookingItems] = useState<BookingsItem | null>(null);
    const [isClicked, setIsClicked] = useState(false);
    const [pickupDate, setPickupDate] = useState<Dayjs|null>(null)
    const [pickupLocation, setPickupLocation] = useState<string>('BKK')

    const showDateFill = async () => {
        setIsClicked(true);

        return (
            <div>
                <LocationDateReserve onDateChange={(dateValue:Dayjs)=>{setPickupDate(dateValue)}}
                onLocationChange={(locaValue:string)=>{setPickupLocation(locaValue)}} />
                <button className="block rounded-md bg-sky-600 hover:bg-indigo-600 px-3 py-2
                    text-white shadow-sm" onClick={editBooking}>
                    {isClicked ? 'saved!' : 'save'}
                </button>
            </div>
        )
    }

    const editBooking = async () => {
        setIsClicked(true);
        try {
            const dateValue = pickupDate; // Declare the dateValue variable and assign it the value of pickupDate
            const response = await fetch(`http://localhost:5000/api/v1/bookings/${bid.params.uid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.user.token}`
                },
                body: JSON.stringify({
                    bookingDate: dateValue?.format('YYYY-MM-DD')
                })
            });

            if (!response.ok) {
                alert('Update Booking failed');
                throw new Error('Update Booking failed');
            }

            useRouter().push(`/cart/${bid.params.uid}/detail`);

        } catch (error) {
            
        }
    }

    const {data: session} = useSession()
    if(!session || !session.user.token) return null

    useEffect(() => {
        const fetchBookings = async () => {
            const bookingDetail = await getBooking(session.user.token, bid.params.uid) as any;
            if (bookingDetail !== undefined) {
                setBookingItems(bookingDetail.data as BookingsItem);
                // console.log("eiei", bookingDetail);
            }
        }
        fetchBookings()
    }, [session.user.token, bid.params.uid])
    // console.log("eiei222", bookingItems);

    return(
        <main className="text-center p-5">
            
            <div className="flex flex-col my-10 mx-20 py-5 block rounded-xl bg-red-50 items-center">
                <div className="font-bold text-2xl text-red-600">Booking Detail</div>
                <Image src={bookingItems?.car?.imageURL ?? ''} alt='Car Image' width={0} height={0} sizes="100vw" className="rounded-lg w-[50%] m-5"/>
                <div className="text-md mx-5 text-left">Car: {bookingItems?.car?.brand} {bookingItems?.car?.carModel}</div>
                <div className="text-md mx-5 text-left">Type: {bookingItems?.car?.type}</div>
                <div className="text-md mx-5 text-left">Price per day: {bookingItems?.car?.pricePerDay} Baht</div>
                <div className="text-md mx-5 text-left">License plate: {bookingItems?.car?.licensePlate}</div>
                <div className="text-md mx-5 text-left">Address: {bookingItems?.car?.address} {bookingItems?.car?.district} {bookingItems?.car?.province} {bookingItems?.car?.province} </div>
                <div className="text-md mx-5 text-left">Google Map URL: {bookingItems?.car?.googleMapsURL}</div>
                <div className="text-md mx-5 text-left">Tel.: {bookingItems?.car?.tel}</div>
                <div className="text-md mx-5 text-left">
                    Pick-up Date: {dayjs(bookingItems?.bookingDate).format('YYYY-MM-DD')}
                    {/* <Image src='/img/editButton.png' alt='Edit Button' width={0} height={0} sizes="100vw" className="w-[5%] m-5"/> */}
                </div>
                <Link href={`/reservations/update?id=${bid.params.uid}&model=${bookingItems?.car?.carModel}`}>
                <button className="block rounded-md bg-sky-600 hover:bg-indigo-600 px-3 py-2
                text-white shadow-sm">
                    Edit Booking
                </button>
                </Link>
            </div>
        </main>
    )
}