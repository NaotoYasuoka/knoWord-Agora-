using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ValueButton : MonoBehaviour
{

    public void OnClick()
    {
        string member = "はなこ,412_たろう,120"; //_たなか,3310";
        agora a = new agora();
        a.move(member);
    }
}
