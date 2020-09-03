using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.Diagnostics;

public class UnMute : MonoBehaviour
{

    public void OnClick()
    {
        agora a = new agora();
        a.unmute();
    }
}
