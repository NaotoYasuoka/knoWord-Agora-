using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Diagnostics;
using System.Text;
using UnityEngine;

public class agora
{
    [DllImport("__Internal")] private static extern void Join(int channel, string uid, string camera, string users);
    [DllImport("__Internal")] private static extern void Leave(int channel, string uid, string camera);
    [DllImport("__Internal")] private static extern void Mute();
    [DllImport("__Internal")] private static extern void Unmute();
    [DllImport("__Internal")] private static extern void Move(string users);


    public void join(int channel, string uid, string camera, string users)
    {
        /* Join the user to the meeting room.
         * [int] channel: Room id (The same RoomID cannot exist.)
         * [string] uid : ID for the user to enter the meeting.(The same ID cannot exist in the same room.)
         * [string] camera : Camera Resolution.(Choose from : "default", "480p", "720p", "1080p")
         * [string] users  : People who attend the meeting.(Form of "name,id_name2,id2_...") 
         */
        Join(channel, uid, camera, users);
    }

    public void leave(int channel, string uid, string camera)
    {
        /* Leaving the meeting room. */
        Leave(channel, uid, camera);
    }

    public void mute()
    {
        /* Mute Audio */
        Mute();
    }

    public void unmute()
    {
        /* UnMute Audio */
        Unmute();
    }

    public void move(string users)
    {
        /* Screen switching (Move screen) */
        Move(users);
    }
}
