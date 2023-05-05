﻿/*
Technitium DNS Server
Copyright (C) 2019  Shreyas Zare (shreyas@technitium.com)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

using System.IO;
using System.Net;
using TechnitiumLibrary.IO;

namespace DnsServerCore.Dhcp.Options
{
    class RequestedIpAddressOption : DhcpOption
    {
        #region variables

        IPAddress _address;

        #endregion

        #region constructor

        public RequestedIpAddressOption(IPAddress address)
            : base(DhcpOptionCode.RequestedIpAddress)
        {
            _address = address;
        }

        public RequestedIpAddressOption(Stream s)
            : base(DhcpOptionCode.RequestedIpAddress, s)
        { }

        #endregion

        #region protected

        protected override void ParseOptionValue(Stream s)
        {
            if (s.Length != 4)
                throw new InvalidDataException();

            _address = new IPAddress(s.ReadBytes(4));
        }

        protected override void WriteOptionValue(Stream s)
        {
            s.Write(_address.GetAddressBytes());
        }

        #endregion

        #region properties

        public IPAddress Address
        { get { return _address; } }

        #endregion
    }
}
