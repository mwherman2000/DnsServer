using System;
using System.ServiceProcess;

namespace DnsService
{
    static class Program
    {
        /// <summary>
        /// The main entry point for the application.
        /// </summary>
        static void Main(string[] args)
        {
            //ServiceBase[] ServicesToRun;
            //ServicesToRun = new ServiceBase[]
            //{
            //    new DnsService()
            //};
            //ServiceBase.Run(ServicesToRun);

            // mwh https://alastaircrabtree.com/how-to-run-a-dotnet-windows-service-as-a-console-app/

            DnsService service = new DnsService();
            if (Environment.UserInteractive)
            {
                Console.WriteLine("DnsService.RunAsConsole(args)");
                service.RunAsConsole(args);
            }
            else
            {
                Console.WriteLine("ServiceBase.Run");
                ServiceBase[] ServicesToRun;
                ServicesToRun = new ServiceBase[] { service };
                ServiceBase.Run(ServicesToRun);
            }
        }
    }
}
