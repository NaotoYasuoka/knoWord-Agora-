using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.Diagnostics;

public class leaveButton : MonoBehaviour
{

    public void OnClick()
    {
        int channel = 125;
        string uid = "120";
        string camera = "default";

        agora a = new agora();
        a.leave(channel, uid, camera);
    }
}
