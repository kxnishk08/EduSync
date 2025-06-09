using Azure.Messaging.EventHubs;
using Azure.Messaging.EventHubs.Producer;
using EduSyncBackend.Models;
using Newtonsoft.Json;
using System.Text;

namespace EduSyncBackend.Services
{
    public class EventHubService : IEventHubService
    {
        private readonly EventHubProducerClient _producerClient;



        public async Task SendQuizAttemptEvent(Result result)
        {
            var eventPayload = new
            {
                result.AssessmentId,
                result.UserId,
                result.Score,
                result.AttemptDate
            };

            var json = JsonConvert.SerializeObject(eventPayload);
            var eventData = new EventData(Encoding.UTF8.GetBytes(json));
            await _producerClient.SendAsync(new[] { eventData });
        }
    }

}