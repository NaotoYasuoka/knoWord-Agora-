using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.Diagnostics;

public class joinButton : MonoBehaviour
{

    public void OnClick()
    {
        Dictionary<string, int> users = new Dictionary<string, int>();
        users.Add("山田太郎", 1);
        users.Add("山本太郎", 2);
        users.Add("鈴木太郎", 3);

        string member = "たろう,120_はなこ,412_やまだ,125_はなの,410_たろ,122_はな,41_たろ,122_はなし,4_たろこ,1222_はなみ,400"; //_たなか,3310";

        int channel = 125;
        string uid = "400";
        string camera = "default";

        agora a = new agora();
        a.join(channel, uid, camera, member);
    }

}
