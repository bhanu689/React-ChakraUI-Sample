import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Button,
  Image,
  Select,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
  HStack,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Center,
  Flex
} from '@chakra-ui/react';

const retryRequest = async (url, retries = 3, delay = 1000) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise(res => setTimeout(res, delay * Math.pow(2, 3 - retries)));
    return retryRequest(url, retries - 1, delay);
  }
};

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [countryFilter, setCountryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await retryRequest('https://randomuser.me/api/?results=5000');
        setUsers(data.results);
        setFilteredUsers(data.results);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to fetch users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCountryFilter = (event) => {
    const selectedCountry = event.target.value;
    setCountryFilter(selectedCountry);
    if (selectedCountry === '') {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter(user => user.location.country === selectedCountry));
    }
  };

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const countries = Array.from(new Set(users.map(user => user.location.country)))
    .sort((a, b) => a.localeCompare(b));  // Sort countries alphabetically

  const totalPages = Math.ceil(filteredUsers.length / recordsPerPage);

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error) {
    return <Alert status="error"><AlertIcon />{error}</Alert>;
  }

  return (
    <VStack spacing={4}>
      <Flex direction="row" align="center" gap={4}>
        <Select
          onChange={handleCountryFilter}
          placeholder="Filter by Country"
          value={countryFilter}
          w="200px"
          mt="10px"
        >
          <option value="">All Countries</option>
          {countries.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </Select>

        <Select
          onChange={(e) => setRecordsPerPage(e.target.value)}
          value={recordsPerPage}
          w="auto"
          mt="10px"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </Select>
      </Flex>

      <Table variant="striped" colorScheme="teal">
        <Thead>
          <Tr>
            <Th>Avatar</Th>
            <Th>First Name</Th>
            <Th>Last Name</Th>
            <Th>City</Th>
            <Th>Country</Th>
          </Tr>
        </Thead>
        <Tbody>
          {paginatedUsers.map(user => (
            <Tr key={user.login.uuid}>
              <Td><Image boxSize="50px" src={user.picture.thumbnail} alt="avatar" /></Td>
              <Td>{user.name.first}</Td>
              <Td>{user.name.last}</Td>
              <Td>{user.location.city}</Td>
              <Td>{user.location.country}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <HStack spacing={4}>
        <Button colorScheme='teal' variant='solid' onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} isDisabled={currentPage === 1}>
          Previous
        </Button>
        <Text>Page {currentPage} of {totalPages}</Text>
        <Button colorScheme='teal' variant='solid' onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} isDisabled={currentPage === totalPages}>
          Next
        </Button>
      </HStack>
    </VStack>
  );
};

export default UserList;
