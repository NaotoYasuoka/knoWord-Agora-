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


    /// <summary>
    /// 特定のユーザーを会議に参加させる。
    /// </summary>
    /// <param name="channel">入室したいRoomID</param>
    /// <param name="uid">入室するユーザー</param>
    /// <param name="camera">
    /// "default", "480p", "720p", "1080p"の中から選択
    /// </param>
    /// <param name="users"> しりとりに参加しているユーザー情報("name,id_name2,id2_..."という形式)</param>
    public void join(int channel, string uid, string camera, string users)
    {
        Join(channel, uid, camera, users);
    }

    /// <summary>
    /// 特定のユーザーを会議から退室させる。
    /// </summary>
    /// <param name="channel">退室したいRoomID</param>
    /// <param name="uid">退室するユーザー</param>
    /// <param name="camera">
    /// "default", "480p", "720p", "1080p"の中から選択
    /// </param>
    public void leave(int channel, string uid, string camera)
    {
        /// Leaving the meeting room. 
        Leave(channel, uid, camera);
    }

    /// <summary>
    /// 特定のユーザーをミュートにする。
    /// </summary>
    public void mute()
    {
        Mute();
    }

    /// <summary>
    /// 特定のユーザーのミュートを解除する。
    /// </summary>
    public void unmute()
    {
        Unmute();
    }
    /// <summary>
    /// しりとり順に沿って、画面を移動させる。
    /// </summary>
    /// <param name="users">　しりとりに参加しているユーザー情報("name,id_name2,id2_..."という形式)　</param>
    public void move(string users)
    {
        Move(users);
    }
}
