using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace MvcWithAngular2.Models
{
    public class Room
    {
        public int ID { get; set; }

        public string Token { get; set; }

        public string Name { get; set; }

        public string SharedWith { get; set; }

        public string Status { get; set; }

        public System.DateTime LastUpdated { get; set; }

        public string OwnerName { get; set; }

        public string OwnerToken { get; set; }

        public string ParticipantName { get; set; }

        public string ParticipantToken { get; set; }
    }
    public class SDPMessage
    {


        public int ID { get; set; }

        public string SDP { get; set; }

        public bool IsProcessed { get; set; }

        public string RoomToken { get; set; }

        public string Sender { get; set; }
    }

    public class CandidatesTable
    {

        public int ID { get; set; }

        public string Candidate { get; set; }

        public string Label { get; set; }

        public string RoomToken { get; set; }

        public string Sender { get; set; }

        public bool IsProcessed { get; set; }
    }

    public class WebRTCDataContext : DbContext
    {
        public WebRTCDataContext() : base("WebRTCData") { }
        public DbSet<CandidatesTable> CandidatesTables { get; set; }
        public DbSet<SDPMessage> SDPMessages { get; set; }
        public DbSet<Room> Rooms { get; set; }
    }
}