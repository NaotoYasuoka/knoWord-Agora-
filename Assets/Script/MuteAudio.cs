using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.Diagnostics;

public class MuteAudio : MonoBehaviour
{

    public void OnClick()
    {
        agora a = new agora();
        a.mute();
    }
}
