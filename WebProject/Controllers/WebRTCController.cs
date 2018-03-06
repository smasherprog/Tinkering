using MvcWithAngular2.Models;
using System;
using System.Linq;
using System.Web.Mvc;
using System.Web.WebPages;

namespace MvcWithAngular2.Controllers
{
    public static class TempExtensions
    {
        public static string GetValidatedString(this string text)
        {
            return text.Replace("-equal", "=").Replace("_plus_", "+").Replace("--", " ").Replace("-qmark", "?").Replace("-nsign", "#").Replace("-n", " <br />").Replace("-lt", "&lt;").Replace("-gt", "&gt;").Replace("-amp", "&").Replace("__", "-");
        }

    }
    public class RandomNumbers
    {
        internal static string GetRandomNumbers(int length = 6)
        {
            var values = new byte[length];
            var rnd = new Random();
            rnd.NextBytes(values);
            return values.Aggregate(string.Empty, (current, v) => current + v.ToString());
        }
    }
    public class WebRTCController : Controller
    {
        readonly WebRTCDataContext _db = new WebRTCDataContext();

        [HttpPost]
        public JsonResult CreateRoom(string Name, string Room, string partnerEmail = null)
        {
            if (Name.IsEmpty() || Room.IsEmpty()) return Json(false);

            back:
            string token = RandomNumbers.GetRandomNumbers();
            if (_db.Rooms.Any(r => r.Token == token)) goto back;

            back2:
            string ownerToken = RandomNumbers.GetRandomNumbers();
            if (_db.Rooms.Any(r => r.OwnerToken == ownerToken)) goto back2;

            var room = new Room
            {
                Token = token,
                Name = Room.GetValidatedString(),
                OwnerName = Name.GetValidatedString(),
                OwnerToken = ownerToken,
                LastUpdated = DateTime.Now,
                SharedWith = partnerEmail.IsEmpty() ? "Public" : partnerEmail,
                Status = Status.Available
            };

            _db.Rooms.Add(room);
            _db.SaveChanges();
            return new JsonResult
            {
                Data = new
                {
                    roomToken = room.Token,
                    ownerToken = room.OwnerToken
                }
            };
        }

        [HttpPost]
        public JsonResult JoinRoom(string participant, string roomToken, string partnerEmail = null)
        {
            if (participant.IsEmpty() || roomToken.IsEmpty()) return Json(false);

            var room = _db.Rooms.FirstOrDefault(r => r.Token == roomToken);
            if (room == null) return Json(false);

            if (room.SharedWith != "Public")
            {
                if (partnerEmail.IsEmpty()) return Json(false);
                if (room.SharedWith != partnerEmail) return Json(false);
            }

            back:
            string participantToken = RandomNumbers.GetRandomNumbers();
            if (_db.Rooms.Any(r => r.OwnerToken == participantToken)) goto back;

            room.ParticipantName = participant.GetValidatedString();
            room.ParticipantToken = participantToken;
            room.LastUpdated = DateTime.Now;
            room.Status = Status.Active;

            _db.SaveChanges();
            return new JsonResult
            {
                Data = new
                {
                    participantToken,
                    friend = room.OwnerName
                }
            };
        }


        [HttpPost]
        public JsonResult SearchPublicRooms(string partnerEmail)
        {
            if (!partnerEmail.IsEmpty()) return SearchPrivateRooms(partnerEmail);

            var rooms = _db.Rooms.ToList().Where(r => r.SharedWith == "Public" && r.Status == Status.Available && r.LastUpdated.AddMinutes(1) > DateTime.Now).OrderByDescending(o => o.ID);
            return Json(
                new
                {
                    rooms = rooms.Select(r => new
                    {
                        Name = r.Name,
                        Room = r.OwnerName,
                        Token = r.Token
                    }),
                    availableRooms = rooms.Count(),
                    publicActiveRooms = _db.Rooms.ToList().Count(r => r.Status == Status.Active && r.LastUpdated.AddMinutes(1) > DateTime.Now && r.SharedWith == "Public"),
                    privateAvailableRooms = _db.Rooms.ToList().Count(r => r.Status == Status.Available && r.LastUpdated.AddMinutes(1) > DateTime.Now && r.SharedWith != "Public")
                }
                );
        }

        [HttpPost]
        public JsonResult SearchPrivateRooms(string partnerEmail)
        {
            if (partnerEmail.IsEmpty()) return Json(false);

            var rooms = _db.Rooms.Where(r => r.SharedWith == partnerEmail && r.Status == Status.Available && r.LastUpdated.AddMinutes(1) > DateTime.Now).OrderByDescending(o => o.ID);
            return Json(new
            {
                rooms = rooms.Select(r => new
                {
                    roomName = r.Name,
                    ownerName = r.OwnerName,
                    roomToken = r.Token
                })
            });
        }


        [HttpPost]
        public JsonResult PostSDP(string sdp, string roomToken, string userToken)
        {
            if (sdp.IsEmpty() || roomToken.IsEmpty() || userToken.IsEmpty()) return Json(false);

            var sdpMessage = new SDPMessage
            {
                SDP = sdp,
                IsProcessed = false,
                RoomToken = roomToken,
                Sender = userToken
            };

            _db.SDPMessages.Add(sdpMessage);
            _db.SaveChanges();

            return Json(true);
        }

        [HttpPost]
        public JsonResult GetSDP(string roomToken, string userToken)
        {
            if (roomToken.IsEmpty() || userToken.IsEmpty()) return Json(false);

            var sdp = _db.SDPMessages.FirstOrDefault(s => s.RoomToken == roomToken && s.Sender != userToken && !s.IsProcessed);

            if (sdp == null) return Json(false);

            sdp.IsProcessed = true;
            _db.SaveChanges();

            return Json(new
            {
                sdp = sdp.SDP
            });
        }


        [HttpPost]
        public JsonResult PostICE(string candidate, string label, string roomToken, string userToken)
        {
            if (candidate.IsEmpty() || label.IsEmpty() || roomToken.IsEmpty() || userToken.IsEmpty()) return Json(false);

            var candidateTable = new CandidatesTable
            {
                Candidate = candidate,
                Label = label,
                IsProcessed = false,
                RoomToken = roomToken,
                Sender = userToken
            };

            _db.CandidatesTables.Add(candidateTable);
            _db.SaveChanges();

            return Json(true);
        }

        [HttpPost]
        public JsonResult GetICE(string roomToken, string userToken)
        {
            if (roomToken.IsEmpty() || userToken.IsEmpty()) return Json(false);

            var candidate = _db.CandidatesTables.FirstOrDefault(c => c.RoomToken == roomToken && c.Sender != userToken && !c.IsProcessed);
            if (candidate == null) return Json(false);

            candidate.IsProcessed = true;
            _db.SaveChanges();

            return Json(new
            {
                candidate = candidate.Candidate,
                label = candidate.Label
            });
        }


        [HttpPost]
        public JsonResult GetParticipant(string roomToken, string ownerToken)
        {
            if (roomToken.IsEmpty() || ownerToken.IsEmpty()) return Json(false);

            var room = _db.Rooms.FirstOrDefault(r => r.Token == roomToken && r.OwnerToken == ownerToken);
            if (room == null) return Json(false);

            room.LastUpdated = DateTime.Now;
            _db.SaveChanges();

            if (room.ParticipantName.IsEmpty()) return Json(false);
            return Json(new { participant = room.ParticipantName });
        }

        [HttpPost]
        public JsonResult Stats()
        {
            var numberOfRooms = _db.Rooms.Count();
            var numberOfPublicRooms = _db.Rooms.Count(r => r.SharedWith == "Public");
            var numberOfPrivateRooms = _db.Rooms.Count(r => r.SharedWith != "Public");
            var numberOfEmptyRooms = _db.Rooms.Count(r => r.ParticipantName == null);
            var numberOfFullRooms = _db.Rooms.Count(r => r.ParticipantName != null);
            return Json(new { numberOfRooms, numberOfPublicRooms, numberOfPrivateRooms, numberOfEmptyRooms, numberOfFullRooms });
        }

    }
    struct Status
    {
        public const string Available = "Available";
        public const string Active = "Active";
    }
}