using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.Runtime.InteropServices;

public class ButtonClick : MonoBehaviour
{

    [DllImport("__Internal")]
    private static extern void Hello();
    public GameObject JoinButton;
    // Start is called before the first frame update
    void Start()
    {
    }

    // Update is called once per frame
    void Update()
    {
        if (Input.GetMouseButtonDown(0))
        {
            Hello();
            //Debug.Log(JoinButton.GetInstanceID());
            //int id = JoinButton.GetInstanceID();
            //Join(id);
            // wwwクラスのコンストラクタに画像URLを指定
            //UnityWebRequest www = UnityWebRequestTexture.GetTexture(URI);

            //画像を取得できるまで待つ
            //yield return www.SendWebRequest();
            //取得した画像のテクスチャをRawImageのテクスチャに張り付ける
            // _image.texture = ((DownloadHandlerTexture)www.downloadHandler).texture;


        }
    }
}
