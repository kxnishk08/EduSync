using System.Threading.Tasks;
using EduSyncBackend.Models;

namespace EduSyncBackend.Services
{
    public interface IEventHubService
    {
        Task SendQuizAttemptEvent(Result result);
    }
}