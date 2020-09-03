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
        Join(channel, uid, camera, users);
    }

    public void leave(int channel, string uid, string camera)
    {
        Leave(channel, uid, camera);
    }

    public void mute()
    {
        Mute();
    }

    public void unmute()
    {
        Unmute();
    }

    public void move(string users)
    {
        Move(users);
    }
}
