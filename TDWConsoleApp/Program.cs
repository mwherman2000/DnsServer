using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using TechnitiumLibrary.Net.Dns;
using TechnitiumLibrary.Net.Proxy;

namespace TDWConsoleApp
{
    class Program
    {
        static string serverDomain = "localhost";
        static string domain = "abcd.foo.did";

        static void Main(string[] args)
        {
            domain = "did:foo:abcd";

            //serverDomain = Environment.GetEnvironmentVariable("COMPUTERNAME");
            Console.WriteLine("serverDomain: " + serverDomain);

            DnsDatagram dnsResponseCurrent = GetDnsResponse(serverDomain, domain, DnsResourceRecordType.ANY, "Tcp");
            Array.Sort(dnsResponseCurrent.Answer);
            string sjsonResponseCurrent = JsonConvert.SerializeObject(dnsResponseCurrent.Answer, new StringEnumConverter());
            Console.WriteLine("UpdateSubjectSignatures:sjsonResponseCurrent:" + sjsonResponseCurrent);
            foreach (var record in dnsResponseCurrent.Answer)
            {
                Console.WriteLine(record.Type.ToString() + ":" + record.RDATA);
            }

            Console.WriteLine("Press Enter to exist...");
            Console.ReadLine();
        }

        static private DnsDatagram GetDnsResponse(string serverDomain, string domain, DnsResourceRecordType type, string strProtocol)
        {
            DnsTransportProtocol protocol = (DnsTransportProtocol)Enum.Parse(typeof(DnsTransportProtocol), strProtocol, true);
            const int RETRIES = 1;
            const int TIMEOUT = 10000;

            Console.WriteLine("ResolveQuery: serverDomain: " + serverDomain + "; domain: " + domain + "; type: " + type.ToString());

            DnsDatagram dnsResponse;

            NameServerAddress nameServer;
            nameServer = new NameServerAddress(serverDomain, IPAddress.Parse("127.0.0.1"));
            NetProxy proxy = null; //no proxy required for this server

            dnsResponse = (new DnsClient(nameServer) { Proxy = proxy, PreferIPv6 = false, Protocol = protocol, Retries = RETRIES, Timeout = TIMEOUT }).Resolve(domain, type);

            return dnsResponse;
        }
    }
}
